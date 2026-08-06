const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/pdfmake-pNuCVKVo.js',
      'assets/react-vendor-6aw4XXjH.js',
      'assets/vfs_fonts-CfcbzCvn.js'
    ])
) => i.map((i) => d[i]);
import { j as e, u as na } from './query-vendor-BNjBrM5A.js';
import { r as _, R as Ds } from './react-vendor-6aw4XXjH.js';
import {
  X as Re,
  R as Ne,
  ay as la,
  c as ze,
  t as R,
  Q as ie,
  at as De,
  b1 as rs,
  a$ as ia,
  x as ce,
  a7 as ne,
  b4 as ns,
  g as $e,
  ar as Le,
  ah as Je,
  aK as $s,
  b5 as Ts,
  q as Oe,
  b6 as Ls,
  aD as Ve,
  n as ca,
  aI as ys,
  Y as xe,
  aA as es,
  b7 as da,
  b8 as Cs,
  a as We,
  b9 as ss,
  aC as xa,
  ac as ma,
  ba as Fs,
  P as fe,
  bb as Ps,
  h as pa,
  av as Ms,
  f as ua,
  bc as ba,
  p as Es,
  aQ as Us,
  _ as Bs,
  bd as Gs,
  an as ha,
  a1 as ga,
  a3 as fa
} from './ui-vendor-CTbhg6u_.js';
import { _ as je, u as ve, C as Na } from './index-Cl3qi7_W.js';
import { e as ja } from './exportExcel-D85v870c.js';
import { a as ls, s as is } from './storageUrl-o_giIXns.js';
import {
  E as Te,
  d as va,
  u as _a,
  s as ye,
  C as cs,
  a as ds,
  r as xs,
  i as ms,
  b as ps,
  R as us,
  c as wa,
  e as Vs,
  g as Se,
  h as Hs,
  j as Ks,
  k as ya,
  l as Ca,
  m as Ea,
  n as qs,
  D as ka,
  o as Aa,
  p as Oa,
  q as Js,
  t as Sa,
  w as ks,
  x as Ra,
  y as Ia,
  z as za,
  A as Da,
  B as $a,
  G as bs,
  H as Ta,
  I as Qe,
  S as Ue,
  J as Ze,
  K as La,
  L as Fa,
  M as Pa,
  N as Ma,
  O as Ua,
  P as Ba,
  Q as Ga,
  T as Va,
  U as Ha,
  V as Ka,
  W as qa,
  X as Ja,
  Y as hs,
  Z as Wa,
  _ as Qa,
  $ as Ws,
  a0 as Za,
  a1 as Ya,
  a2 as Xa,
  a3 as et,
  a4 as st,
  a5 as at,
  a6 as Ge,
  a7 as tt,
  a8 as Be,
  f as ot,
  a9 as rt,
  aa as nt,
  ab as lt
} from './calidadService-CJrJdq9w.js';
import { C as it } from './CalidadBadge-Btg5zeYQ.js';
import { f as ct } from './panelPtm-CH5cTgO4.js';
import { u as As } from './useRealtimeTable-fbyVHirV.js';
import './supabase-vendor-4Fjsfb0a.js';
import './animation-vendor-JfdD7EdN.js';
import './xlsx-B2eTCt_Q.js';
const Os = {
  empresa: 'PTM CHILE LTDA.',
  subtitulo: 'Control de Calidad — Recepción de Insumos Médicos',
  norma: 'ISO 13485:2016',
  fecha_revision: '2026-01',
  logo: null,
  logo_w: 257,
  logo_h: 77,
  codigos: {
    checklist: { codigo: 'FO-CAL-001', revision: '01' },
    monitoreo: { codigo: 'FO-CAL-002', revision: '01' },
    danos: { codigo: 'FO-CAL-003', revision: '01' },
    salida: { codigo: 'FO-CAL-004', revision: '01' }
  }
};
function gs(s) {
  const i = Os.codigos[s] || { codigo: 'FO-CAL-000', revision: '01' };
  return { ...Os, ...i };
}
function dt(s) {
  const i = (s || '').split(',')[1] || '',
    d = atob(i),
    c = new Uint8Array(d.length);
  for (let C = 0; C < d.length; C++) c[C] = d.charCodeAt(C);
  return c;
}
const fs = [40, 82, 40, 54];
function Ns(s) {
  const i = gs(s);
  return () => ({
    margin: [40, 16, 40, 0],
    stack: [
      {
        columns: [
          ...(i.logo ? [{ image: i.logo, width: 96, margin: [0, 0, 10, 0] }] : []),
          {
            width: '*',
            stack: [
              { text: i.empresa, bold: !0, fontSize: 13 },
              { text: i.subtitulo, fontSize: 8, color: '#64748b' }
            ]
          },
          {
            width: 'auto',
            table: {
              widths: ['auto', 'auto'],
              body: [
                [
                  { text: 'Código', bold: !0, fontSize: 7 },
                  { text: i.codigo, fontSize: 7 }
                ],
                [
                  { text: 'Revisión', bold: !0, fontSize: 7 },
                  { text: i.revision, fontSize: 7 }
                ],
                [
                  { text: 'Norma', bold: !0, fontSize: 7 },
                  { text: i.norma, fontSize: 7 }
                ]
              ]
            },
            layout: 'noBorders'
          }
        ]
      },
      {
        canvas: [
          { type: 'line', x1: 0, y1: 8, x2: 515, y2: 8, lineWidth: 0.7, lineColor: '#cbd5e1' }
        ]
      }
    ]
  });
}
function js(s) {
  const i = gs(s);
  return (d, c) => ({
    margin: [40, 8, 40, 0],
    stack: [
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cbd5e1' }
        ]
      },
      {
        columns: [
          { text: `${i.codigo} · Rev. ${i.revision} · ${i.norma}`, fontSize: 7, color: '#94a3b8' },
          {
            text: `Documento controlado · Página ${d} de ${c}`,
            fontSize: 7,
            color: '#94a3b8',
            alignment: 'right'
          }
        ],
        margin: [0, 4, 0, 0]
      }
    ]
  });
}
function vs(s, i) {
  const {
      Header: d,
      Footer: c,
      Paragraph: C,
      TextRun: b,
      Table: t,
      TableRow: m,
      TableCell: g,
      WidthType: E,
      AlignmentType: p,
      PageNumber: A,
      BorderStyle: u,
      ImageRun: M
    } = s,
    w = gs(i),
    l = {
      top: { style: u.NONE },
      bottom: { style: u.NONE },
      left: { style: u.NONE },
      right: { style: u.NONE },
      insideHorizontal: { style: u.NONE },
      insideVertical: { style: u.NONE }
    },
    S = new d({
      children: [
        new t({
          width: { size: 100, type: E.PERCENTAGE },
          borders: l,
          rows: [
            new m({
              children: [
                new g({
                  width: { size: 60, type: E.PERCENTAGE },
                  borders: l,
                  children: [
                    ...(w.logo
                      ? [
                          new C({
                            children: [
                              new M({
                                data: dt(w.logo),
                                type: 'png',
                                transformation: {
                                  width: 120,
                                  height: Math.round((120 * w.logo_h) / w.logo_w)
                                }
                              })
                            ]
                          })
                        ]
                      : []),
                    new C({ children: [new b({ text: w.empresa, bold: !0, size: 22 })] }),
                    new C({ children: [new b({ text: w.subtitulo, size: 15, color: '64748B' })] })
                  ]
                }),
                new g({
                  width: { size: 40, type: E.PERCENTAGE },
                  borders: l,
                  children: [
                    new C({
                      alignment: p.RIGHT,
                      children: [
                        new b({ text: `Código: ${w.codigo}  ·  Rev. ${w.revision}`, size: 15 })
                      ]
                    }),
                    new C({
                      alignment: p.RIGHT,
                      children: [
                        new b({
                          text: `${w.norma}  ·  Vig. ${w.fecha_revision}`,
                          size: 15,
                          color: '64748B'
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    $ = new c({
      children: [
        new C({
          alignment: p.CENTER,
          border: { top: { style: u.SINGLE, size: 4, color: 'CBD5E1' } },
          children: [
            new b({
              text: `${w.codigo} · Rev. ${w.revision} · ${w.norma} · Documento controlado · Página `,
              size: 14,
              color: '94A3B8'
            }),
            new b({ children: [A.CURRENT], size: 14, color: '94A3B8' }),
            new b({ text: ' de ', size: 14, color: '94A3B8' }),
            new b({ children: [A.TOTAL_PAGES], size: 14, color: '94A3B8' })
          ]
        })
      ]
    });
  return { header: S, footer: $ };
}
const Qs = (s) =>
  s != null && s.storage_path
    ? ls('monitoreo-evidencias', s.storage_path)
    : Promise.resolve((s == null ? void 0 : s.imagen_url) || '');
async function xt(s) {
  const i = await fetch(s);
  if (!i.ok) throw new Error('No se pudo cargar una imagen de evidencia');
  return await i.arrayBuffer();
}
async function mt(s) {
  const i = await fetch(s);
  if (!i.ok) throw new Error('No se pudo cargar una imagen de evidencia');
  const d = await i.blob();
  return await new Promise((c, C) => {
    const b = new FileReader();
    ((b.onload = () => c(b.result)), (b.onerror = C), b.readAsDataURL(d));
  });
}
function pt(s, i) {
  const d = URL.createObjectURL(s),
    c = document.createElement('a');
  ((c.href = d),
    (c.download = i),
    document.body.appendChild(c),
    c.click(),
    c.remove(),
    setTimeout(() => URL.revokeObjectURL(d), 4e3));
}
function Zs(s, i, d) {
  const c = s.reporte || {},
    C = {};
  return (
    (d || []).forEach((b) => {
      const t = b.item_id || 'general';
      (C[t] = C[t] || []).push(b);
    }),
    { rep: c, evByItem: C }
  );
}
async function ut(s, i = [], d = []) {
  const c = await je(() => import('./index-BmpJy8SR.js'), []),
    {
      Document: C,
      Packer: b,
      Paragraph: t,
      TextRun: m,
      HeadingLevel: g,
      Table: E,
      TableRow: p,
      TableCell: A,
      WidthType: u,
      ImageRun: M,
      AlignmentType: w
    } = c,
    { header: l, footer: S } = vs(c, 'danos'),
    { rep: $, evByItem: T } = Zs(s, i, d),
    x = (v, h) =>
      new p({
        children: [
          new A({
            width: { size: 35, type: u.PERCENTAGE },
            children: [new t({ children: [new m({ text: v, bold: !0 })] })]
          }),
          new A({ width: { size: 65, type: u.PERCENTAGE }, children: [new t(String(h ?? '—'))] })
        ]
      }),
    N = [];
  (N.push(
    new t({ text: 'INFORME DE DAÑOS / NO CONFORMIDAD', heading: g.TITLE, alignment: w.CENTER })
  ),
    $.tipo_producto && N.push(new t({ text: $.tipo_producto, alignment: w.CENTER })),
    N.push(new t({ text: s.numero || '', alignment: w.CENTER })),
    N.push(new t('')),
    N.push(
      new E({
        width: { size: 100, type: u.PERCENTAGE },
        rows: [
          x('Fecha de recepción', $.fecha_recepcion || s.fecha),
          x('Tipo de producto', $.tipo_producto),
          x('Área responsable', $.area_responsable),
          x('Clasificación', $.clasificacion),
          x('Bodega', s.bodega),
          x('Analista', s.analista_nombre)
        ]
      })
    ),
    N.push(new t('')));
  const a = (v, h) => {
    (N.push(new t({ text: v, heading: g.HEADING_2 })), h && N.push(new t(String(h))));
  };
  ($.antecedentes && a('1. ANTECEDENTES', $.antecedentes),
    $.descripcion_hallazgo && a('2. DESCRIPCIÓN DEL HALLAZGO', $.descripcion_hallazgo),
    N.push(new t({ text: '3. DAÑOS IDENTIFICADOS', heading: g.HEADING_2 })));
  let o = 0;
  for (const v of i) {
    o += 1;
    const h =
      [v.componente_afectado, v.tipo_dano].filter(Boolean).join(' — ') ||
      v.producto ||
      `Hallazgo ${o}`;
    N.push(new t({ text: `3.${o} ${h}`, heading: g.HEADING_3 }));
    const L = [];
    ((v.producto || v.codigo_producto) &&
      L.push(
        `Producto: ${v.producto || ''} ${v.codigo_producto ? `(${v.codigo_producto})` : ''}`.trim()
      ),
      Number(v.cantidad) > 0 && L.push(`Cantidad: ${Number(v.cantidad)}`),
      v.ubicacion && L.push(`Ubicación: ${v.ubicacion}`),
      v.partida && L.push(`Lote: ${v.partida}`),
      v.tipo_dano && L.push(`Tipo de daño: ${v.tipo_dano}`),
      v.componente_afectado && L.push(`Componente afectado: ${v.componente_afectado}`),
      v.consecuencia && L.push(`Consecuencia: ${v.consecuencia}`),
      v.observaciones && L.push(`Observaciones: ${v.observaciones}`),
      L.forEach((Q) => N.push(new t({ children: [new m(Q)] }))));
    const q = T[v.id] || [];
    for (const Q of q)
      try {
        const F = await xt(await Qs(Q));
        (N.push(
          new t({
            children: [new M({ data: F, type: 'jpg', transformation: { width: 320, height: 240 } })]
          })
        ),
          Q.descripcion &&
            N.push(new t({ children: [new m({ text: Q.descripcion, italics: !0, size: 18 })] })));
      } catch {}
    N.push(new t(''));
  }
  (Array.isArray($.cuadro_resumen) &&
    $.cuadro_resumen.length &&
    (N.push(new t({ text: '4. CUADRO RESUMEN DE HALLAZGOS', heading: g.HEADING_2 })),
    N.push(
      new E({
        width: { size: 100, type: u.PERCENTAGE },
        rows: [
          new p({
            children: [
              new A({ children: [new t({ children: [new m({ text: 'Indicador', bold: !0 })] })] }),
              new A({ children: [new t({ children: [new m({ text: 'Valor', bold: !0 })] })] })
            ]
          }),
          ...$.cuadro_resumen.map(
            (v) =>
              new p({
                children: [
                  new A({ children: [new t(String(v.indicador ?? ''))] }),
                  new A({ children: [new t(String(v.valor ?? ''))] })
                ]
              })
          )
        ]
      })
    ),
    N.push(new t(''))),
    $.analisis_causa && a('5. ANÁLISIS Y CAUSA PROBABLE', $.analisis_causa),
    Array.isArray($.acciones_recomendadas) &&
      $.acciones_recomendadas.length &&
      (N.push(new t({ text: '6. ACCIONES RECOMENDADAS', heading: g.HEADING_2 })),
      $.acciones_recomendadas
        .filter(Boolean)
        .forEach((v) => N.push(new t({ text: v, bullet: { level: 0 } }))),
      N.push(new t(''))),
    N.push(new t('')),
    N.push(
      new E({
        width: { size: 100, type: u.PERCENTAGE },
        rows: [
          new p({
            children: [
              new A({
                children: [
                  new t('_______________________________'),
                  new t({
                    children: [
                      new m({
                        text: $.elaborado_por || s.analista_nombre || 'Nombre / Firma',
                        bold: !0
                      })
                    ]
                  }),
                  new t('Elaborado por — Control de Operaciones')
                ]
              }),
              new A({
                children: [
                  new t('_______________________________'),
                  new t({
                    children: [new m({ text: $.revisado_por || 'Nombre / Firma', bold: !0 })]
                  }),
                  new t('Revisado por — Jefatura / Supervisión')
                ]
              })
            ]
          })
        ]
      })
    ));
  const f = new C({
      sections: [{ headers: { default: l }, footers: { default: S }, children: N }]
    }),
    n = await b.toBlob(f);
  pt(n, `${s.numero || 'Informe_Danos'}.docx`);
}
async function bt(s, i = [], d = []) {
  var w;
  const c = await je(
      () => import('./pdfmake-pNuCVKVo.js').then((l) => l.p),
      __vite__mapDeps([0, 1])
    ),
    C = await je(() => import('./vfs_fonts-CfcbzCvn.js').then((l) => l.v), __vite__mapDeps([2, 1])),
    b = c.default || c,
    t = C.default || C;
  b.vfs = ((w = t.pdfMake) == null ? void 0 : w.vfs) || t.vfs || b.vfs;
  const { rep: m, evByItem: g } = Zs(s, i, d),
    E = [];
  (E.push({ text: 'INFORME DE DAÑOS / NO CONFORMIDAD', style: 'title' }),
    m.tipo_producto && E.push({ text: m.tipo_producto, alignment: 'center', margin: [0, 0, 0, 2] }),
    E.push({ text: s.numero || '', alignment: 'center', margin: [0, 0, 0, 10], color: '#64748b' }));
  const p = (l, S) => [{ text: l, bold: !0 }, { text: String(S ?? '—') }];
  E.push({
    table: {
      widths: ['35%', '65%'],
      body: [
        p('Fecha de recepción', m.fecha_recepcion || s.fecha),
        p('Tipo de producto', m.tipo_producto),
        p('Área responsable', m.area_responsable),
        p('Clasificación', m.clasificacion),
        p('Bodega', s.bodega),
        p('Analista', s.analista_nombre)
      ]
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 12]
  });
  const A = (l, S) => {
    (E.push({ text: l, style: 'h2' }), S && E.push({ text: String(S), margin: [0, 0, 0, 8] }));
  };
  (m.antecedentes && A('1. ANTECEDENTES', m.antecedentes),
    m.descripcion_hallazgo && A('2. DESCRIPCIÓN DEL HALLAZGO', m.descripcion_hallazgo),
    E.push({ text: '3. DAÑOS IDENTIFICADOS', style: 'h2' }));
  let u = 0;
  for (const l of i) {
    u += 1;
    const S =
      [l.componente_afectado, l.tipo_dano].filter(Boolean).join(' — ') ||
      l.producto ||
      `Hallazgo ${u}`;
    E.push({ text: `3.${u} ${S}`, style: 'h3' });
    const $ = [];
    ((l.producto || l.codigo_producto) &&
      $.push(
        `Producto: ${l.producto || ''} ${l.codigo_producto ? `(${l.codigo_producto})` : ''}`.trim()
      ),
      Number(l.cantidad) > 0 && $.push(`Cantidad: ${Number(l.cantidad)}`),
      l.ubicacion && $.push(`Ubicación: ${l.ubicacion}`),
      l.partida && $.push(`Lote: ${l.partida}`),
      l.tipo_dano && $.push(`Tipo de daño: ${l.tipo_dano}`),
      l.componente_afectado && $.push(`Componente afectado: ${l.componente_afectado}`),
      l.consecuencia && $.push(`Consecuencia: ${l.consecuencia}`),
      l.observaciones && $.push(`Observaciones: ${l.observaciones}`),
      $.length && E.push({ ul: $, margin: [0, 0, 0, 6] }));
    const T = g[l.id] || [],
      x = [];
    for (const N of T)
      try {
        const a = await mt(await Qs(N));
        x.push({ image: a, width: 220, margin: [0, 4, 8, 4] });
      } catch {}
    x.length && E.push({ columns: x, columnGap: 8, margin: [0, 0, 0, 8] });
  }
  (Array.isArray(m.cuadro_resumen) &&
    m.cuadro_resumen.length &&
    (E.push({ text: '4. CUADRO RESUMEN DE HALLAZGOS', style: 'h2' }),
    E.push({
      table: {
        widths: ['70%', '30%'],
        body: [
          [
            { text: 'Indicador', bold: !0 },
            { text: 'Valor', bold: !0 }
          ],
          ...m.cuadro_resumen.map((l) => [String(l.indicador ?? ''), String(l.valor ?? '')])
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    })),
    m.analisis_causa && A('5. ANÁLISIS Y CAUSA PROBABLE', m.analisis_causa),
    Array.isArray(m.acciones_recomendadas) &&
      m.acciones_recomendadas.length &&
      (E.push({ text: '6. ACCIONES RECOMENDADAS', style: 'h2' }),
      E.push({ ul: m.acciones_recomendadas.filter(Boolean), margin: [0, 0, 0, 12] })),
    E.push({
      columns: [
        {
          stack: [
            { text: '_______________________________', margin: [0, 20, 0, 0] },
            { text: m.elaborado_por || s.analista_nombre || 'Nombre / Firma', bold: !0 },
            { text: 'Elaborado por — Control de Operaciones', fontSize: 9, color: '#64748b' }
          ]
        },
        {
          stack: [
            { text: '_______________________________', margin: [0, 20, 0, 0] },
            { text: m.revisado_por || 'Nombre / Firma', bold: !0 },
            { text: 'Revisado por — Jefatura / Supervisión', fontSize: 9, color: '#64748b' }
          ]
        }
      ],
      columnGap: 24
    }));
  const M = {
    pageMargins: fs,
    header: Ns('danos'),
    footer: js('danos'),
    content: E,
    defaultStyle: { fontSize: 10 },
    styles: {
      title: { fontSize: 16, bold: !0, alignment: 'center', margin: [0, 0, 0, 2] },
      h2: { fontSize: 12, bold: !0, margin: [0, 10, 0, 4] },
      h3: { fontSize: 11, bold: !0, margin: [0, 6, 0, 2] }
    }
  };
  b.createPdf(M).download(`${s.numero || 'Informe_Danos'}.pdf`);
}
function ht(s, i) {
  const d = URL.createObjectURL(s),
    c = document.createElement('a');
  ((c.href = d),
    (c.download = i),
    document.body.appendChild(c),
    c.click(),
    c.remove(),
    setTimeout(() => URL.revokeObjectURL(d), 4e3));
}
const He = {
  LIBERAR: 'Liberado',
  CUARENTENA: 'Cuarentena',
  REPROCESO: 'Reproceso',
  RECHAZAR: 'Rechazado',
  BAJA: 'Baja'
};
function Ys(s) {
  const i = (c) => s.filter(c).length,
    d = [...new Set(s.map((c) => c.condicion_observada).filter(Boolean))];
  return {
    total: s.length,
    dictaminados: i((c) => c.dictamen),
    pendientes: i((c) => !c.dictamen),
    problema: i((c) => c.condicion_observada && c.condicion_observada !== 'OK'),
    noReg: i((c) => c.no_registrado),
    rojo: i((c) => c.semaforo === 'ROJO'),
    naranja: i((c) => c.semaforo === 'NARANJA'),
    verde: i((c) => c.semaforo === 'VERDE'),
    porDictamen: ['LIBERAR', 'CUARENTENA', 'REPROCESO', 'RECHAZAR', 'BAJA']
      .map((c) => ({ d: c, n: i((C) => C.dictamen === c) }))
      .filter((c) => c.n > 0),
    porCondicion: d.map((c) => ({ x: c, n: i((C) => C.condicion_observada === c) }))
  };
}
async function gt(s, i = []) {
  const d = await je(() => import('./index-BmpJy8SR.js'), []),
    {
      Document: c,
      Packer: C,
      Paragraph: b,
      TextRun: t,
      HeadingLevel: m,
      Table: g,
      TableRow: E,
      TableCell: p,
      WidthType: A,
      AlignmentType: u
    } = d,
    { header: M, footer: w } = vs(d, 'monitoreo'),
    l = Ys(i),
    S = (o, f) =>
      new E({
        children: [
          new p({
            width: { size: 35, type: A.PERCENTAGE },
            children: [new b({ children: [new t({ text: o, bold: !0 })] })]
          }),
          new p({ width: { size: 65, type: A.PERCENTAGE }, children: [new b(String(f ?? '—'))] })
        ]
      }),
    $ = (o) => new p({ children: [new b({ children: [new t({ text: o, bold: !0, size: 18 })] })] }),
    T = (o) =>
      new p({ children: [new b({ children: [new t({ text: String(o ?? '—'), size: 18 })] })] }),
    x = [];
  (x.push(new b({ text: 'INFORME DE MONITOREO A CALIDAD', heading: m.TITLE, alignment: u.CENTER })),
    x.push(new b({ text: s.numero || '', alignment: u.CENTER })),
    x.push(new b('')),
    x.push(
      new g({
        width: { size: 100, type: A.PERCENTAGE },
        rows: [
          S('Fecha', s.fecha),
          S('Bodega', s.bodega),
          S('Analista', s.analista_nombre),
          S('Periodicidad', s.periodicidad),
          S('Estado', (s.estado || '').replace('_', ' '))
        ]
      })
    ),
    x.push(new b('')),
    x.push(new b({ text: '1. RESUMEN EJECUTIVO', heading: m.HEADING_2 })),
    x.push(
      new g({
        width: { size: 100, type: A.PERCENTAGE },
        rows: [
          S('Total de ítems', l.total),
          S('Dictaminados', l.dictaminados),
          S('Pendientes', l.pendientes),
          S('Con problema (condición ≠ OK)', l.problema),
          S('No registrados en sistema', l.noReg),
          S('Semáforo vencimiento (🔴/🟠/🟢)', `${l.rojo} / ${l.naranja} / ${l.verde}`),
          ...l.porDictamen.map((o) => S(`Dictamen · ${He[o.d] || o.d}`, o.n))
        ]
      })
    ),
    x.push(new b('')),
    x.push(new b({ text: '2. DETALLE DE ÍTEMS', heading: m.HEADING_2 })),
    x.push(
      new g({
        width: { size: 100, type: A.PERCENTAGE },
        rows: [
          new E({
            children: [
              'SKU',
              'Producto',
              'Lote/Serie',
              'Ubic.',
              'Cant',
              'Afect.',
              'Condición',
              'Dictamen'
            ].map($)
          }),
          ...i.map(
            (o) =>
              new E({
                children: [
                  T(o.codigo_producto),
                  T(o.producto),
                  T(o.partida),
                  T(o.ubicacion),
                  T(o.cantidad),
                  T(o.cantidad_afectada || 0),
                  T((o.no_registrado ? 'NO REG · ' : '') + (o.condicion_observada || '')),
                  T(o.dictamen ? He[o.dictamen] || o.dictamen : 'Pendiente')
                ]
              })
          )
        ]
      })
    ),
    x.push(new b('')),
    x.push(new b('')),
    x.push(
      new g({
        width: { size: 100, type: A.PERCENTAGE },
        rows: [
          new E({
            children: [
              new p({
                children: [
                  new b('_______________________________'),
                  new b({
                    children: [new t({ text: s.analista_nombre || 'Nombre / Firma', bold: !0 })]
                  }),
                  new b('Analista — Monitoreo')
                ]
              }),
              new p({
                children: [
                  new b('_______________________________'),
                  new b({ children: [new t({ text: 'Nombre / Firma', bold: !0 })] }),
                  new b('Calidad — Dictamen')
                ]
              })
            ]
          })
        ]
      })
    ));
  const N = new c({
      sections: [{ headers: { default: M }, footers: { default: w }, children: x }]
    }),
    a = await C.toBlob(N);
  ht(a, `${s.numero || 'Informe_Monitoreo'}.docx`);
}
async function ft(s, i = []) {
  var E;
  const d = await je(
      () => import('./pdfmake-pNuCVKVo.js').then((p) => p.p),
      __vite__mapDeps([0, 1])
    ),
    c = await je(() => import('./vfs_fonts-CfcbzCvn.js').then((p) => p.v), __vite__mapDeps([2, 1])),
    C = d.default || d,
    b = c.default || c;
  C.vfs = ((E = b.pdfMake) == null ? void 0 : E.vfs) || b.vfs || C.vfs;
  const t = Ys(i),
    m = (p, A) => [{ text: p, bold: !0 }, { text: String(A ?? '—') }],
    g = [];
  (g.push({ text: 'INFORME DE MONITOREO A CALIDAD', style: 'title' }),
    g.push({ text: s.numero || '', alignment: 'center', margin: [0, 0, 0, 10], color: '#64748b' }),
    g.push({
      table: {
        widths: ['35%', '65%'],
        body: [
          m('Fecha', s.fecha),
          m('Bodega', s.bodega),
          m('Analista', s.analista_nombre),
          m('Periodicidad', s.periodicidad),
          m('Estado', (s.estado || '').replace('_', ' '))
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    }),
    g.push({ text: '1. Resumen ejecutivo', style: 'h2' }),
    g.push({
      table: {
        widths: ['60%', '40%'],
        body: [
          m('Total de ítems', t.total),
          m('Dictaminados', t.dictaminados),
          m('Pendientes', t.pendientes),
          m('Con problema (condición ≠ OK)', t.problema),
          m('No registrados en sistema', t.noReg),
          m('Semáforo vencimiento (R/N/V)', `${t.rojo} / ${t.naranja} / ${t.verde}`),
          ...t.porDictamen.map((p) => m(`Dictamen · ${He[p.d] || p.d}`, p.n))
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    }),
    g.push({ text: '2. Detalle de ítems', style: 'h2' }),
    g.push({
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto', 'auto', 22, 22, 'auto', 'auto'],
        body: [
          ['SKU', 'Producto', 'Lote/Serie', 'Ubic.', 'Cant', 'Afe.', 'Condición', 'Dictamen'].map(
            (p) => ({ text: p, bold: !0, fontSize: 8 })
          ),
          ...i.map((p) => [
            { text: p.codigo_producto || '', fontSize: 8 },
            { text: p.producto || '', fontSize: 8 },
            { text: p.partida || '', fontSize: 8 },
            { text: p.ubicacion || '', fontSize: 8 },
            { text: String(p.cantidad ?? ''), fontSize: 8 },
            { text: String(p.cantidad_afectada || 0), fontSize: 8 },
            {
              text: (p.no_registrado ? 'NO REG · ' : '') + (p.condicion_observada || ''),
              fontSize: 8
            },
            { text: p.dictamen ? He[p.dictamen] || p.dictamen : 'Pendiente', fontSize: 8 }
          ])
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 16]
    }),
    g.push({
      columns: [
        {
          stack: [
            { text: '_______________________________', margin: [0, 20, 0, 0] },
            { text: s.analista_nombre || 'Nombre / Firma', bold: !0 },
            { text: 'Analista — Monitoreo', fontSize: 9, color: '#64748b' }
          ]
        },
        {
          stack: [
            { text: '_______________________________', margin: [0, 20, 0, 0] },
            { text: 'Nombre / Firma', bold: !0 },
            { text: 'Calidad — Dictamen', fontSize: 9, color: '#64748b' }
          ]
        }
      ],
      columnGap: 24
    }),
    C.createPdf({
      pageMargins: fs,
      header: Ns('monitoreo'),
      footer: js('monitoreo'),
      content: g,
      defaultStyle: { fontSize: 10 },
      styles: {
        title: { fontSize: 16, bold: !0, alignment: 'center', margin: [0, 0, 0, 2] },
        h2: { fontSize: 12, bold: !0, margin: [0, 10, 0, 4] }
      }
    }).download(`${s.numero || 'Informe_Monitoreo'}.pdf`));
}
async function _s(s) {
  try {
    const i = await createImageBitmap(s),
      d = 1600;
    let { width: c, height: C } = i;
    if (c > d || C > d) {
      const g = Math.min(d / c, d / C);
      ((c = Math.round(c * g)), (C = Math.round(C * g)));
    }
    const b = document.createElement('canvas');
    return (
      (b.width = c),
      (b.height = C),
      b.getContext('2d').drawImage(i, 0, 0, c, C),
      (await new Promise((g) => b.toBlob(g, 'image/jpeg', 0.82))) || s
    );
  } catch {
    return s;
  }
}
const ws = ({ onCapture: s, onClose: i }) => {
    const d = _.useRef(null),
      c = _.useRef(null),
      [C, b] = _.useState('environment'),
      [t, m] = _.useState(null),
      [g, E] = _.useState(null),
      [p, A] = _.useState(null),
      [u, M] = _.useState(!0),
      w = _.useCallback(() => {
        var a;
        try {
          (a = c.current) == null || a.getTracks().forEach((o) => o.stop());
        } catch {}
        c.current = null;
      }, []),
      l = _.useCallback(
        async (a) => {
          var o;
          (w(), M(!0), A(null));
          try {
            if (!((o = navigator.mediaDevices) != null && o.getUserMedia))
              throw new Error('sin getUserMedia');
            const f = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: { ideal: a }, width: { ideal: 1920 }, height: { ideal: 1080 } },
              audio: !1
            });
            ((c.current = f),
              d.current && ((d.current.srcObject = f), await d.current.play().catch(() => {})));
          } catch {
            A(
              'No se pudo abrir la cámara. Revisa el permiso de cámara de la app y vuelve a intentar (o usa "Galería").'
            );
          } finally {
            M(!1);
          }
        },
        [w]
      );
    _.useEffect(() => (l(C), w), []);
    const S = () => {
        const a = C === 'environment' ? 'user' : 'environment';
        (b(a), l(a));
      },
      $ = () => {
        const a = d.current;
        if (!a || !a.videoWidth) return R.error('La cámara aún no está lista');
        const o = document.createElement('canvas');
        ((o.width = a.videoWidth),
          (o.height = a.videoHeight),
          o.getContext('2d').drawImage(a, 0, 0, o.width, o.height),
          o.toBlob(
            (f) => {
              if (!f) return R.error('No se pudo capturar la foto');
              (E(f), m(URL.createObjectURL(f)), w());
            },
            'image/jpeg',
            0.9
          ));
      },
      T = () => {
        (t && URL.revokeObjectURL(t), m(null), E(null), l(C));
      },
      x = () => {
        if (!g) return;
        const a = new File([g], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
        (t && URL.revokeObjectURL(t), s == null || s(a), i == null || i());
      },
      N = () => {
        (w(), t && URL.revokeObjectURL(t), i == null || i());
      };
    return e.jsxs('div', {
      className: 'fixed inset-0 z-[300] bg-black flex flex-col select-none',
      style: {
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      },
      children: [
        e.jsxs('div', {
          className: 'flex items-center justify-between px-4 py-3 text-white shrink-0',
          children: [
            e.jsx('button', {
              onClick: N,
              className: 'p-2 -m-2',
              'aria-label': 'Cerrar',
              children: e.jsx(Re, { size: 26 })
            }),
            e.jsx('span', { className: 'text-sm font-black tracking-wide', children: 'CÁMARA' }),
            e.jsx('button', {
              onClick: S,
              className: 'p-2 -m-2 disabled:opacity-30',
              disabled: !!t || !!p,
              'aria-label': 'Cambiar cámara',
              children: e.jsx(Ne, { size: 22 })
            })
          ]
        }),
        e.jsxs('div', {
          className: 'flex-1 relative overflow-hidden flex items-center justify-center bg-black',
          children: [
            p
              ? e.jsx('div', {
                  className: 'text-white/80 text-center px-8 text-sm leading-relaxed',
                  children: p
                })
              : t
                ? e.jsx('img', {
                    src: t,
                    alt: 'captura',
                    className: 'w-full h-full object-contain'
                  })
                : e.jsx('video', {
                    ref: d,
                    autoPlay: !0,
                    playsInline: !0,
                    muted: !0,
                    className: 'w-full h-full object-cover'
                  }),
            u &&
              !t &&
              !p &&
              e.jsx('div', {
                className: 'absolute inset-0 flex items-center justify-center text-white/70',
                children: e.jsx(Ne, { className: 'animate-spin', size: 30 })
              })
          ]
        }),
        e.jsx('div', {
          className: 'px-6 py-7 flex items-center justify-center gap-10 shrink-0',
          children: t
            ? e.jsxs(e.Fragment, {
                children: [
                  e.jsxs('button', {
                    onClick: T,
                    className: 'flex flex-col items-center gap-1 text-white active:scale-95',
                    children: [
                      e.jsx(la, { size: 28 }),
                      e.jsx('span', { className: 'text-[11px] font-bold', children: 'Repetir' })
                    ]
                  }),
                  e.jsx('button', {
                    onClick: x,
                    className:
                      'w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg active:scale-95',
                    'aria-label': 'Usar foto',
                    children: e.jsx(ze, { size: 32 })
                  })
                ]
              })
            : e.jsx('button', {
                onClick: $,
                disabled: u || !!p,
                className:
                  'w-[76px] h-[76px] rounded-full border-[5px] border-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform',
                'aria-label': 'Tomar foto',
                children: e.jsx('span', { className: 'w-14 h-14 rounded-full bg-white' })
              })
        })
      ]
    });
  },
  Nt = ({
    informeId: s,
    itemId: i,
    evidencias: d = [],
    onChanged: c,
    canManage: C = !0,
    compact: b = !1
  }) => {
    const { user: t } = ve(),
      m = _.useRef(null),
      [g, E] = _.useState(!1),
      [p, A] = _.useState(!1),
      u = Na.isNativePlatform() || (typeof navigator < 'u' && navigator.maxTouchPoints > 0),
      [M, w] = _.useState(null),
      [l, S] = _.useState({});
    _.useEffect(() => {
      let a = !0;
      return (
        is(
          Te,
          d.map((o) => o.storage_path)
        ).then((o) => {
          a && S(o);
        }),
        () => {
          a = !1;
        }
      );
    }, [d]);
    const $ = C && !!s && !!i,
      T = async (a) => {
        var f;
        const o = Array.from(a.target.files || []);
        if (((a.target.value = ''), !(!o.length || !s))) {
          A(!0);
          try {
            for (const n of o) {
              if (!n.type.startsWith('image/')) continue;
              const v = await _s(n);
              await _a({ informeId: s, itemId: i, blob: v, user: t });
            }
            (R.success(o.length > 1 ? 'Fotos agregadas' : 'Foto agregada'), c == null || c());
          } catch (n) {
            R.error(
              (f = n == null ? void 0 : n.message) != null && f.includes('row-level security')
                ? 'No tienes permiso para subir fotos'
                : `Error al subir: ${n.message}`
            );
          } finally {
            A(!1);
          }
        }
      },
      x = async (a) => {
        if (confirm('¿Eliminar esta foto?'))
          try {
            (await va(a), R.success('Foto eliminada'), c == null || c());
          } catch {
            R.error('No se pudo eliminar la foto');
          }
      },
      N = b ? 'w-16 h-16' : 'w-20 h-20';
    return e.jsxs('div', {
      children: [
        e.jsxs('div', {
          className: 'flex items-center gap-2 flex-wrap',
          children: [
            d.map((a) =>
              e.jsxs(
                'div',
                {
                  className: `relative group ${N} rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0`,
                  children: [
                    e.jsx('img', {
                      src: l[a.storage_path] || '',
                      alt: a.descripcion || '',
                      className: 'w-full h-full object-cover cursor-zoom-in',
                      onClick: () => l[a.storage_path] && w(l[a.storage_path])
                    }),
                    C &&
                      e.jsx('button', {
                        onClick: () => x(a),
                        title: 'Eliminar foto',
                        className:
                          'absolute top-0.5 right-0.5 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity active:scale-90',
                        children: e.jsx(ie, { size: 12 })
                      })
                  ]
                },
                a.id
              )
            ),
            C &&
              u &&
              e.jsxs('button', {
                type: 'button',
                onClick: () => E(!0),
                disabled: !$ || p,
                title: i ? 'Tomar foto con la cámara' : 'Guarda el borrador para adjuntar fotos',
                className: `${N} shrink-0 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-500 flex flex-col items-center justify-center gap-1 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed`,
                children: [
                  p ? e.jsx(Ne, { size: 18, className: 'animate-spin' }) : e.jsx(De, { size: 18 }),
                  e.jsx('span', {
                    className: 'text-[8px] font-black uppercase tracking-wider',
                    children: 'Cámara'
                  })
                ]
              }),
            C &&
              e.jsxs('button', {
                type: 'button',
                onClick: () => {
                  var a;
                  return (a = m.current) == null ? void 0 : a.click();
                },
                disabled: !$ || p,
                title: i
                  ? 'Subir foto desde archivos/galería'
                  : 'Guarda el borrador para adjuntar fotos',
                className: `${N} shrink-0 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-1 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed`,
                children: [
                  p ? e.jsx(Ne, { size: 18, className: 'animate-spin' }) : e.jsx(rs, { size: 18 }),
                  e.jsx('span', {
                    className: 'text-[8px] font-black uppercase tracking-wider',
                    children: u ? 'Galería' : 'Foto'
                  })
                ]
              }),
            d.length === 0 &&
              !C &&
              e.jsxs('span', {
                className: 'text-xs text-slate-400 flex items-center gap-1',
                children: [e.jsx(ia, { size: 14 }), ' Sin fotos']
              })
          ]
        }),
        C &&
          !i &&
          e.jsx('p', {
            className: 'text-[10px] text-amber-600 mt-1',
            children: 'Guarda el borrador para poder adjuntar fotos a este hallazgo.'
          }),
        e.jsx('input', {
          ref: m,
          type: 'file',
          accept: 'image/*',
          multiple: !0,
          onChange: T,
          className: 'hidden'
        }),
        g &&
          e.jsx(ws, {
            onCapture: (a) => T({ target: { files: [a], value: '' } }),
            onClose: () => E(!1)
          }),
        M &&
          e.jsxs('div', {
            className: 'fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4',
            onClick: () => w(null),
            children: [
              e.jsx('button', {
                className: 'absolute top-4 right-4 text-white/80 hover:text-white p-2',
                children: e.jsx(Re, { size: 28 })
              }),
              e.jsx('img', {
                src: M,
                alt: '',
                className: 'max-w-full max-h-full object-contain rounded-xl'
              })
            ]
          })
      ]
    });
  },
  Ae = (s) => (s.checklist && s.checklist._extras) || {},
  Ke = {
    PALLET: 'Foto del pallet',
    EMBALAJE: 'Foto del embalaje',
    CAMION: 'Foto dentro del camión',
    PRODUCTO: 'Foto del producto',
    DOCUMENTO: 'Documentación',
    GENERAL: 'Foto general'
  };
function jt(s, i) {
  const d = URL.createObjectURL(s),
    c = document.createElement('a');
  ((c.href = d),
    (c.download = i),
    document.body.appendChild(c),
    c.click(),
    c.remove(),
    setTimeout(() => URL.revokeObjectURL(d), 4e3));
}
const Xs = { OK: 'Conforme', NO: 'No conforme', NA: 'N/A' },
  vt = { IMPORTACION: 'Importación', NACIONAL: 'Nacional' };
function Fe(s, i = {}) {
  return i.tipo === 'SALIDA' || s.tipo === 'CERTIFICADO_SALIDA';
}
function ea(s, i = {}) {
  if (Fe(s, i))
    return s.resultado === 'CONFORME'
      ? 'CERTIFICADO DE CONFORMIDAD DE SALIDA'
      : s.resultado === 'NO_CONFORME'
        ? 'ACTA — CERTIFICACIÓN DE SALIDA (NO CONFORME)'
        : 'CERTIFICACIÓN DE SALIDA';
  const d = i.soloNoSanitario ? ' (PRODUCTO NO SANITARIO)' : '';
  return s.resultado === 'CONFORME'
    ? `CERTIFICADO DE CONFORMIDAD${d}`
    : s.resultado === 'NO_CONFORME'
      ? 'ACTA — CHECKLIST DE INGRESO (NO CONFORME)'
      : 'ACTA — CHECKLIST DE INGRESO';
}
function sa(s, i = {}) {
  const d = s.contexto || {};
  return Fe(s, i)
    ? [
        ['Cliente', s.proveedor],
        ['Nota de Venta', s.oc],
        ['Guía de despacho', d.guia],
        ['Factura', d.factura],
        ['Transportista', d.transportista || d.empresa_transporte],
        ['Fecha de despacho', s.fecha_recepcion],
        ['Bultos', s.bultos]
      ]
    : [
        ['Proveedor', s.proveedor],
        ['Orden de compra', s.oc],
        ['Origen', vt[s.origen] || s.origen],
        ['Fecha de recepción', s.fecha_recepcion],
        ['Bultos', s.bultos]
      ];
}
const as = (s, i) => (Fe(s, i) ? 'salida' : 'checklist');
function qe(s = {}) {
  const i = s.categorias || [];
  return i.length
    ? i
        .map((d) => `${d.label}${d.clase_riesgo ? ` (Clase ${d.clase_riesgo})` : ''} × ${d.items}`)
        .join('; ')
    : '';
}
function aa(s, i) {
  const d = s.folio || `CheckList_${s.oc || 'ingreso'}`;
  return `${String(d).replace(/[^\w.-]+/g, '_')}.${i}`;
}
async function ta(s, i = [], d = {}) {
  var Q, F, Z, O, J, X, ee;
  const c = await je(() => import('./index-BmpJy8SR.js'), []),
    {
      Document: C,
      Packer: b,
      Paragraph: t,
      TextRun: m,
      HeadingLevel: g,
      Table: E,
      TableRow: p,
      TableCell: A,
      WidthType: u,
      AlignmentType: M,
      ShadingType: w,
      BorderStyle: l
    } = c,
    { header: S, footer: $ } = vs(c, as(s, d)),
    T = Fe(s, d),
    x = s.resultado === 'CONFORME',
    N = {
      top: { style: l.NONE },
      bottom: { style: l.NONE },
      left: { style: l.NONE },
      right: { style: l.NONE },
      insideHorizontal: { style: l.NONE },
      insideVertical: { style: l.NONE }
    },
    a = (D, H) =>
      new p({
        children: [
          new A({
            width: { size: 35, type: u.PERCENTAGE },
            children: [new t({ children: [new m({ text: D, bold: !0 })] })]
          }),
          new A({ width: { size: 65, type: u.PERCENTAGE }, children: [new t(String(H ?? '—'))] })
        ]
      }),
    o = (D) => new A({ children: [new t({ children: [new m({ text: D, bold: !0, size: 18 })] })] }),
    f = (D) =>
      new A({ children: [new t({ children: [new m({ text: String(D ?? '—'), size: 18 })] })] }),
    n = [];
  (n.push(new t({ text: ea(s, d), heading: g.TITLE, alignment: M.CENTER })),
    d.soloNoSanitario &&
      n.push(
        new t({
          alignment: M.CENTER,
          children: [
            new m({
              text: 'Documento de conformidad de recepción — no constituye certificación de dispositivo médico bajo ISO 13485.',
              italics: !0,
              size: 16,
              color: '64748B'
            })
          ]
        })
      ),
    n.push(new t('')),
    n.push(
      new E({
        width: { size: 100, type: u.PERCENTAGE },
        rows: [
          new p({
            children: [
              new A({
                shading: { fill: x ? 'ECFDF5' : 'FEF2F2', type: w.CLEAR, color: 'auto' },
                children: [
                  new t({
                    children: [
                      new m({
                        text: x
                          ? T
                            ? 'CERTIFICADO DE CONFORMIDAD DE SALIDA — CONFORME'
                            : 'CERTIFICADO DE CONFORMIDAD — CONFORME'
                          : T
                            ? 'SALIDA NO CONFORME — NO DESPACHAR'
                            : 'RECEPCIÓN NO CONFORME',
                        bold: !0,
                        color: x ? '047857' : 'BE123C'
                      })
                    ]
                  }),
                  new t({
                    children: [new m({ text: `Folio: ${s.folio || '—'}`, bold: !0, size: 26 })]
                  }),
                  new t({
                    children: [
                      new m({
                        text: `${s.realizado_nombre || ''}${s.completado_en ? ' · ' + new Date(s.completado_en).toLocaleString('es-CL') : ''}`,
                        size: 16,
                        color: '475569'
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    ),
    n.push(new t('')),
    n.push(
      new E({
        width: { size: 100, type: u.PERCENTAGE },
        rows: [
          ...sa(s, d).map(([D, H]) => a(D, H)),
          a(
            'Resultado',
            x ? 'CONFORME' : s.resultado === 'NO_CONFORME' ? 'NO CONFORME' : s.estado || '—'
          ),
          ...(T ? [a('Estado de despacho', `${ye(s).emoji} ${ye(s).label}`)] : []),
          ...(qe(d) ? [a('Familias de producto', qe(d))] : []),
          ...(s.disposicion ? [a('Disposición / Acción a tomar', s.disposicion)] : []),
          a('Responsable de Calidad', s.realizado_nombre),
          a(
            'Fecha de finalización',
            s.completado_en ? new Date(s.completado_en).toLocaleString('es-CL') : '—'
          )
        ]
      })
    ),
    n.push(new t('')));
  const v = T && Array.isArray((Q = s.contexto) == null ? void 0 : Q.skus) ? s.contexto.skus : [];
  v.length &&
    (n.push(new t({ text: 'SKUs del despacho', heading: g.HEADING_2 })),
    n.push(
      new E({
        width: { size: 100, type: u.PERCENTAGE },
        rows: [
          new p({ children: ['Código', 'Producto', 'Ubicación', 'Cantidad'].map(o) }),
          ...v.map(
            (D) =>
              new p({
                children: [
                  f(D.codigo_producto),
                  f(D.producto),
                  f(D.ubicacion),
                  f(`${D.cantidad ?? '—'} ${D.unidad_medida || ''}`.trim())
                ]
              })
          )
        ]
      })
    ),
    n.push(new t('')));
  const h = s.checklist || {};
  if (
    (i.forEach((D) => {
      (n.push(new t({ text: D.titulo, heading: g.HEADING_2 })),
        n.push(
          new E({
            width: { size: 100, type: u.PERCENTAGE },
            rows: [
              new p({ children: ['Requisito', 'Resultado', 'Evidencia', 'Observación'].map(o) }),
              ...D.params.map((H) => {
                var Y, W, y;
                return new p({
                  children: [
                    f(H.label),
                    f(Xs[(Y = h[H.id]) == null ? void 0 : Y.estado] || '—'),
                    f(((W = h[H.id]) == null ? void 0 : W.evidencia) || '—'),
                    f(((y = h[H.id]) == null ? void 0 : y.nota) || '')
                  ]
                });
              })
            ]
          })
        ),
        n.push(new t('')));
    }),
    !T)
  ) {
    const D = Ae(s);
    (Array.isArray(D.clasificacion) &&
      D.clasificacion.length &&
      (n.push(new t({ text: 'Clasificación del producto', heading: g.HEADING_2 })),
      cs.forEach((W) => {
        n.push(new t(`${D.clasificacion.includes(W.id) ? '☑' : '☐'} ${W.label}`));
      }),
      n.push(new t(''))),
      D.embalaje &&
        Object.values(D.embalaje).some(Boolean) &&
        (n.push(new t({ text: 'Evaluación del embalaje', heading: g.HEADING_2 })),
        n.push(
          new E({
            width: { size: 100, type: u.PERCENTAGE },
            rows: ds.map((W) => a(W.label, D.embalaje[W.id] || '—'))
          })
        ),
        n.push(new t(''))));
    const H = xs(s.checklist);
    (n.push(
      new E({
        width: { size: 100, type: u.PERCENTAGE },
        rows: [
          ...(D.disposicionInmediata ? [a('Disposición inmediata', D.disposicionInmediata)] : []),
          a('Riesgo de la recepción', `${H.emoji} ${H.label}`)
        ]
      })
    ),
      n.push(new t('')));
    const Y = ms(s);
    (n.push(new t({ text: 'Indicadores ISO', heading: g.HEADING_2 })),
      n.push(
        new E({
          width: { size: 100, type: u.PERCENTAGE },
          rows: [
            a('Tiempo recepción', Y.minutos != null ? `${Y.minutos} minutos` : '—'),
            a('Inspector', Y.inspector || '—'),
            a('N° ítems', Y.items),
            a('Conformes', Y.ok),
            a('No conformes', Y.no),
            a('Resultado', Y.pct != null ? `${String(Y.pct).replace('.', ',')}%` : '—')
          ]
        })
      ),
      n.push(new t('')));
  }
  if (T) {
    const D = Ae(s),
      H = ps(
        (F = D.pesos) == null ? void 0 : F.esperado,
        (Z = D.pesos) == null ? void 0 : Z.registrado
      );
    (((O = D.pesos) != null && O.esperado) || ((J = D.pesos) != null && J.registrado)) &&
      (n.push(new t({ text: 'Control de peso', heading: g.HEADING_2 })),
      n.push(
        new E({
          width: { size: 100, type: u.PERCENTAGE },
          rows: [
            a(
              'Peso esperado',
              (X = D.pesos) != null && X.esperado ? `${D.pesos.esperado} kg` : '—'
            ),
            a(
              'Peso registrado',
              (ee = D.pesos) != null && ee.registrado ? `${D.pesos.registrado} kg` : '—'
            ),
            a('Resultado', H || '—')
          ]
        })
      ),
      n.push(new t('')));
    const Y = Number(D.bultosTotal ?? s.bultos) || 0;
    if (Y > 0) {
      const W = Array.isArray(D.bultosEtiquetas) ? D.bultosEtiquetas : [];
      (n.push(new t({ text: 'Verificación de bultos', heading: g.HEADING_2 })),
        n.push(
          new E({
            width: { size: 100, type: u.PERCENTAGE },
            rows: [
              new p({ children: ['Bulto', 'Etiqueta'].map(o) }),
              ...Array.from(
                { length: Math.min(Y, 60) },
                (y, U) =>
                  new p({
                    children: [f(`Bulto ${U + 1}/${Y}`), f(W[U] ? 'Etiqueta OK' : 'Pendiente')]
                  })
              )
            ]
          })
        ),
        n.push(new t('')));
    }
    (Array.isArray(D.riesgos) &&
      D.riesgos.length &&
      (n.push(new t({ text: 'Riesgos evaluados', heading: g.HEADING_2 })),
      us.forEach((W) => {
        n.push(new t(`${D.riesgos.includes(W.id) ? '☑' : '☐'} ${W.label}`));
      }),
      n.push(new t(''))),
      Array.isArray(D.evidencias) &&
        D.evidencias.length &&
        (n.push(new t({ text: 'Evidencia fotográfica', heading: g.HEADING_2 })),
        ['PALLET', 'EMBALAJE', 'CAMION'].forEach((W) => {
          const y = D.evidencias.filter((U) => U.tipo === W).length;
          y && n.push(new t(`📷 ${Ke[W]}: ${y} foto(s) asociada(s) al certificado.`));
        }),
        n.push(
          new t({
            children: [
              new m({
                text: 'Las imágenes quedan almacenadas junto al certificado en el sistema CCO (se incluyen en la versión PDF).',
                size: 16,
                color: '64748B'
              })
            ]
          })
        ),
        n.push(new t(''))));
  }
  if (!T) {
    const D = Ae(s);
    Array.isArray(D.evidencias) &&
      D.evidencias.length &&
      (n.push(new t({ text: 'Evidencia fotográfica', heading: g.HEADING_2 })),
      [...new Set(D.evidencias.map((H) => H.tipo))].forEach((H) => {
        const Y = D.evidencias.filter((W) => W.tipo === H).length;
        Y && n.push(new t(`📷 ${Ke[H] || H}: ${Y} foto(s) asociada(s) al checklist.`));
      }),
      n.push(
        new t({
          children: [
            new m({
              text: 'Las imágenes quedan almacenadas junto al checklist en el sistema CCO (se incluyen en la versión PDF).',
              size: 16,
              color: '64748B'
            })
          ]
        })
      ),
      n.push(new t('')));
  }
  (s.observaciones &&
    (n.push(new t({ text: 'Observaciones', heading: g.HEADING_2 })),
    n.push(new t(s.observaciones)),
    n.push(new t(''))),
    n.push(new t('')),
    n.push(
      new E({
        width: { size: 100, type: u.PERCENTAGE },
        borders: N,
        rows: [
          new p({
            children: [
              new A({
                borders: N,
                children: [
                  new t('_______________________________'),
                  new t({
                    children: [new m({ text: s.realizado_nombre || 'Nombre / Firma', bold: !0 })]
                  }),
                  new t(T ? 'Calidad — Certificación de salida' : 'Calidad — Inspección de ingreso')
                ]
              }),
              new A({
                borders: N,
                children: [
                  new t('_______________________________'),
                  new t({ children: [new m({ text: 'Nombre / Firma', bold: !0 })] }),
                  new t(T ? 'Despacho / Bodega' : 'Recepción / Bodega')
                ]
              })
            ]
          })
        ]
      })
    ),
    s.firma_digital &&
      (n.push(new t('')),
      n.push(new t({ children: [new m({ text: 'FIRMA ELECTRÓNICA', bold: !0 })] })),
      n.push(
        new t({
          children: [
            new m({
              text: `Algoritmo: ${s.firma_algoritmo || 'HMAC-SHA256'} · Firmado por: ${s.firmado_nombre || '—'} · ${s.firmado_en ? new Date(s.firmado_en).toLocaleString('es-CL') : ''}`,
              size: 16,
              color: '475569'
            })
          ]
        })
      ),
      n.push(new t({ children: [new m({ text: s.firma_digital, size: 12, color: '94A3B8' })] })),
      n.push(
        new t({
          children: [
            new m({
              text: `Verificar en: ${window.location.origin}/verificar?folio=${s.folio || ''}`,
              size: 14,
              color: '475569'
            })
          ]
        })
      )));
  const L = new C({
      sections: [{ headers: { default: S }, footers: { default: $ }, children: n }]
    }),
    q = await b.toBlob(L);
  jt(q, aa(s, 'docx'));
}
async function oa(s, i = [], d = {}) {
  var w, l, S, $, T, x, N, a;
  const c = await je(
      () => import('./pdfmake-pNuCVKVo.js').then((o) => o.p),
      __vite__mapDeps([0, 1])
    ),
    C = await je(() => import('./vfs_fonts-CfcbzCvn.js').then((o) => o.v), __vite__mapDeps([2, 1])),
    b = c.default || c,
    t = C.default || C;
  b.vfs = ((w = t.pdfMake) == null ? void 0 : w.vfs) || t.vfs || b.vfs;
  const m = s.checklist || {},
    g = Fe(s, d),
    E = s.resultado === 'CONFORME',
    p = s.completado_en ? new Date(s.completado_en).toLocaleString('es-CL') : '—',
    A = (o, f) => [{ text: o, bold: !0 }, { text: String(f ?? '—') }],
    u = [];
  (u.push({
    text: ea(s, d),
    style: 'title',
    color: E ? '#047857' : s.resultado === 'NO_CONFORME' ? '#be123c' : '#0f172a'
  }),
    d.soloNoSanitario &&
      u.push({
        text: 'Documento de conformidad de recepción — no constituye certificación de dispositivo médico bajo ISO 13485.',
        italics: !0,
        fontSize: 8,
        color: '#64748b',
        alignment: 'center',
        margin: [0, 0, 0, 4]
      }),
    u.push({
      table: {
        widths: ['*'],
        body: [
          [
            {
              fillColor: E ? '#ecfdf5' : '#fef2f2',
              margin: [10, 8, 10, 8],
              stack: [
                {
                  text: E
                    ? g
                      ? 'CERTIFICADO DE CONFORMIDAD DE SALIDA — CONFORME'
                      : 'CERTIFICADO DE CONFORMIDAD — CONFORME'
                    : g
                      ? 'SALIDA NO CONFORME — NO DESPACHAR'
                      : 'RECEPCIÓN NO CONFORME',
                  bold: !0,
                  fontSize: 11,
                  color: E ? '#047857' : '#be123c'
                },
                ...(g
                  ? [
                      {
                        text: `● ${ye(s).label}`,
                        bold: !0,
                        fontSize: 12,
                        color: ye(s).color,
                        margin: [0, 2, 0, 0]
                      }
                    ]
                  : []),
                { text: `Folio: ${s.folio || '—'}`, bold: !0, fontSize: 14, margin: [0, 2, 0, 0] },
                {
                  text: `${s.realizado_nombre || ''}${s.completado_en ? ' · ' + p : ''}`,
                  fontSize: 8,
                  color: '#475569',
                  margin: [0, 2, 0, 0]
                }
              ]
            }
          ]
        ]
      },
      layout: {
        hLineColor: () => (E ? '#a7f3d0' : '#fecaca'),
        vLineColor: () => (E ? '#a7f3d0' : '#fecaca'),
        hLineWidth: () => 1,
        vLineWidth: () => 1
      },
      margin: [0, 6, 0, 12]
    }),
    u.push({
      table: {
        widths: ['35%', '65%'],
        body: [
          ...sa(s, d).map(([o, f]) => A(o, f)),
          A(
            'Resultado',
            E ? 'CONFORME' : s.resultado === 'NO_CONFORME' ? 'NO CONFORME' : s.estado || '—'
          ),
          ...(g
            ? [
                [
                  { text: 'Estado de despacho', bold: !0 },
                  { text: ye(s).label, bold: !0, color: ye(s).color }
                ]
              ]
            : []),
          ...(qe(d) ? [A('Familias de producto', qe(d))] : []),
          ...(s.disposicion ? [A('Disposición / Acción a tomar', s.disposicion)] : []),
          A('Responsable de Calidad', s.realizado_nombre),
          A('Fecha de finalización', p)
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    }));
  const M = g && Array.isArray((l = s.contexto) == null ? void 0 : l.skus) ? s.contexto.skus : [];
  if (
    (M.length &&
      (u.push({ text: 'SKUs del despacho', style: 'h2' }),
      u.push({
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'],
          body: [
            ['Código', 'Producto', 'Ubicación', 'Cantidad'].map((o) => ({
              text: o,
              bold: !0,
              fontSize: 9
            })),
            ...M.map((o) => [
              { text: o.codigo_producto || '—', fontSize: 9 },
              { text: o.producto || '—', fontSize: 9 },
              { text: o.ubicacion || '—', fontSize: 9 },
              { text: `${o.cantidad ?? '—'} ${o.unidad_medida || ''}`.trim(), fontSize: 9 }
            ])
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 12]
      })),
    i.forEach((o) => {
      (u.push({ text: o.titulo, style: 'h2' }),
        u.push({
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', '28%'],
            body: [
              ['Requisito', 'Resultado', 'Evidencia', 'Observación'].map((f) => ({
                text: f,
                bold: !0,
                fontSize: 9
              })),
              ...o.params.map((f) => {
                var v, h, L;
                const n = (v = m[f.id]) == null ? void 0 : v.estado;
                return [
                  { text: f.label, fontSize: 9 },
                  {
                    text: Xs[n] || '—',
                    fontSize: 9,
                    bold: !0,
                    color: n === 'NO' ? '#be123c' : n === 'OK' ? '#047857' : '#64748b'
                  },
                  {
                    text: ((h = m[f.id]) == null ? void 0 : h.evidencia) || '—',
                    fontSize: 9,
                    color: '#475569'
                  },
                  { text: ((L = m[f.id]) == null ? void 0 : L.nota) || '', fontSize: 9 }
                ];
              })
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 12]
        }));
    }),
    !g)
  ) {
    const o = Ae(s);
    (Array.isArray(o.clasificacion) &&
      o.clasificacion.length &&
      (u.push({ text: 'Clasificación del producto', style: 'h2' }),
      u.push({
        columns: [0, 1].map((v) => ({
          stack: cs
            .filter((h, L) => L % 2 === v)
            .map((h) => ({
              text: `${o.clasificacion.includes(h.id) ? '☑' : '☐'} ${h.label}`,
              fontSize: 9,
              margin: [0, 1, 0, 1]
            }))
        })),
        columnGap: 24,
        margin: [0, 0, 0, 12]
      })),
      o.embalaje &&
        Object.values(o.embalaje).some(Boolean) &&
        (u.push({ text: 'Evaluación del embalaje', style: 'h2' }),
        u.push({
          table: {
            widths: ['35%', '65%'],
            body: ds.map((v) => {
              const h = o.embalaje[v.id] || '—',
                L =
                  ['Malo', 'Incorrecto', 'Sí'].includes(h) ||
                  (v.id === 'pallet' && h === 'Regular');
              return [
                { text: v.label, bold: !0 },
                { text: h, bold: !0, color: h === '—' ? '#64748b' : L ? '#be123c' : '#047857' }
              ];
            })
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 12]
        })));
    const f = xs(s.checklist);
    u.push({
      table: {
        widths: ['35%', '65%'],
        body: [
          ...(o.disposicionInmediata
            ? [
                [
                  { text: 'Disposición inmediata', bold: !0 },
                  { text: o.disposicionInmediata, bold: !0 }
                ]
              ]
            : []),
          [
            { text: 'Riesgo de la recepción', bold: !0 },
            { text: `● ${f.label}`, bold: !0, color: f.color }
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    });
    const n = ms(s);
    (u.push({ text: 'Indicadores ISO', style: 'h2' }),
      u.push({
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*', '*', '*'],
          body: [
            [
              'Tiempo recepción',
              'Inspector',
              'N° ítems',
              'Conformes',
              'No conformes',
              'Resultado'
            ].map((v) => ({ text: v, bold: !0, fontSize: 8 })),
            [
              { text: n.minutos != null ? `${n.minutos} min` : '—', fontSize: 9 },
              { text: n.inspector || '—', fontSize: 9 },
              { text: String(n.items), fontSize: 9 },
              { text: String(n.ok), fontSize: 9, color: '#047857', bold: !0 },
              {
                text: String(n.no),
                fontSize: 9,
                color: n.no > 0 ? '#be123c' : '#64748b',
                bold: !0
              },
              {
                text: n.pct != null ? `${String(n.pct).replace('.', ',')}%` : '—',
                fontSize: 9,
                bold: !0
              }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 12]
      }));
  }
  if (g) {
    const o = Ae(s),
      f = ps(
        (S = o.pesos) == null ? void 0 : S.esperado,
        ($ = o.pesos) == null ? void 0 : $.registrado
      );
    (((T = o.pesos) != null && T.esperado) || ((x = o.pesos) != null && x.registrado)) &&
      (u.push({ text: 'Control de peso', style: 'h2' }),
      u.push({
        table: {
          widths: ['35%', '65%'],
          body: [
            A(
              'Peso esperado',
              (N = o.pesos) != null && N.esperado ? `${o.pesos.esperado} kg` : '—'
            ),
            A(
              'Peso registrado',
              (a = o.pesos) != null && a.registrado ? `${o.pesos.registrado} kg` : '—'
            ),
            [
              { text: 'Resultado', bold: !0 },
              { text: f || '—', bold: !0, color: f === 'CONFORME' ? '#047857' : '#be123c' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 12]
      }));
    const n = Number(o.bultosTotal ?? s.bultos) || 0;
    if (n > 0) {
      const h = Array.isArray(o.bultosEtiquetas) ? o.bultosEtiquetas : [];
      (u.push({ text: 'Verificación de bultos', style: 'h2' }),
        u.push({
          table: {
            headerRows: 1,
            widths: ['auto', '*'],
            body: [
              ['Bulto', 'Etiqueta'].map((L) => ({ text: L, bold: !0, fontSize: 9 })),
              ...Array.from({ length: Math.min(n, 60) }, (L, q) => [
                { text: `Bulto ${q + 1}/${n}`, fontSize: 9 },
                {
                  text: h[q] ? 'Etiqueta OK' : 'Pendiente',
                  fontSize: 9,
                  bold: !0,
                  color: h[q] ? '#047857' : '#b45309'
                }
              ])
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 12]
        }));
    }
    Array.isArray(o.riesgos) &&
      o.riesgos.length &&
      (u.push({ text: 'Riesgos evaluados', style: 'h2' }),
      u.push({
        columns: [0, 1].map((h) => ({
          stack: us
            .filter((L, q) => q % 2 === h)
            .map((L) => ({
              text: `${o.riesgos.includes(L.id) ? '☑' : '☐'} ${L.label}`,
              fontSize: 9,
              margin: [0, 1, 0, 1]
            }))
        })),
        columnGap: 24,
        margin: [0, 0, 0, 12]
      }));
    const v = Array.isArray(d.evidenciasImg) ? d.evidenciasImg : [];
    if (v.length || (Array.isArray(o.evidencias) && o.evidencias.length))
      if ((u.push({ text: 'Evidencia fotográfica', style: 'h2' }), v.length))
        for (let h = 0; h < v.length; h += 2)
          u.push({
            columns: v.slice(h, h + 2).map((L) => ({
              width: '50%',
              stack: [
                { image: L.dataUrl, fit: [230, 160] },
                { text: Ke[L.tipo] || L.tipo, fontSize: 8, color: '#64748b', margin: [0, 2, 0, 0] }
              ]
            })),
            columnGap: 12,
            margin: [0, 0, 0, 8]
          });
      else
        u.push({
          text: `${(o.evidencias || []).length} foto(s) asociada(s) al certificado en el sistema CCO.`,
          fontSize: 9,
          color: '#64748b',
          margin: [0, 0, 0, 12]
        });
  }
  if (!g) {
    const o = Ae(s),
      f = Array.isArray(d.evidenciasImg) ? d.evidenciasImg : [];
    if (f.length || (Array.isArray(o.evidencias) && o.evidencias.length))
      if ((u.push({ text: 'Evidencia fotográfica', style: 'h2' }), f.length))
        for (let n = 0; n < f.length; n += 2)
          u.push({
            columns: f.slice(n, n + 2).map((v) => ({
              width: '50%',
              stack: [
                { image: v.dataUrl, fit: [230, 160] },
                { text: Ke[v.tipo] || v.tipo, fontSize: 8, color: '#64748b', margin: [0, 2, 0, 0] }
              ]
            })),
            columnGap: 12,
            margin: [0, 0, 0, 8]
          });
      else
        u.push({
          text: `${(o.evidencias || []).length} foto(s) asociada(s) al checklist en el sistema CCO.`,
          fontSize: 9,
          color: '#64748b',
          margin: [0, 0, 0, 12]
        });
  }
  if (
    (s.observaciones &&
      (u.push({ text: 'Observaciones', style: 'h2' }),
      u.push({ text: s.observaciones, margin: [0, 0, 0, 12] })),
    u.push({
      columns: [
        {
          stack: [
            { text: '_______________________________', margin: [0, 20, 0, 0] },
            { text: s.realizado_nombre || 'Nombre / Firma', bold: !0 },
            {
              text: g ? 'Calidad — Certificación de salida' : 'Calidad — Inspección de ingreso',
              fontSize: 9,
              color: '#64748b'
            }
          ]
        },
        {
          stack: [
            { text: '_______________________________', margin: [0, 20, 0, 0] },
            { text: 'Nombre / Firma', bold: !0 },
            { text: g ? 'Despacho / Bodega' : 'Recepción / Bodega', fontSize: 9, color: '#64748b' }
          ]
        }
      ],
      columnGap: 24
    }),
    s.firma_digital)
  ) {
    const o = `${window.location.origin}/verificar?folio=${encodeURIComponent(s.folio || '')}`;
    u.push({
      columns: [
        {
          width: '*',
          stack: [
            { text: 'FIRMA ELECTRÓNICA', bold: !0, fontSize: 9, color: '#0f172a' },
            {
              text: `Algoritmo: ${s.firma_algoritmo || 'HMAC-SHA256'}`,
              fontSize: 8,
              color: '#475569'
            },
            { text: `Firmado por: ${s.firmado_nombre || '—'}`, fontSize: 8, color: '#475569' },
            {
              text: `Fecha: ${s.firmado_en ? new Date(s.firmado_en).toLocaleString('es-CL') : '—'}`,
              fontSize: 8,
              color: '#475569'
            },
            { text: s.firma_digital, fontSize: 6, color: '#94a3b8', margin: [0, 2, 0, 0] }
          ]
        },
        {
          width: 'auto',
          stack: [
            { qr: o, fit: 84, foreground: '#0f172a', margin: [0, 2, 0, 0] },
            { text: 'Escanee para verificar', fontSize: 7, alignment: 'center', color: '#64748b' }
          ]
        }
      ],
      columnGap: 16,
      margin: [0, 14, 0, 0]
    });
  }
  b.createPdf({
    pageMargins: fs,
    header: Ns(as(s, d)),
    footer: js(as(s, d)),
    content: u,
    defaultStyle: { fontSize: 10 },
    styles: {
      title: { fontSize: 16, bold: !0, alignment: 'center', margin: [0, 0, 0, 2] },
      h2: { fontSize: 12, bold: !0, margin: [0, 10, 0, 4] }
    }
  }).download(aa(s, 'pdf'));
}
const _t = (s) => ({
    nivel: `cat_${s.codigo}`,
    titulo: `Requisitos específicos — ${s.label}${s.clase_riesgo ? ` (Clase ${s.clase_riesgo})` : ''}`,
    categoria: s.codigo,
    params: s.params || []
  }),
  ts = {
    IMPORTACION: { label: 'Importación', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    NACIONAL: { label: 'Nacional', cls: 'bg-teal-100 text-teal-700 border-teal-200' }
  },
  wt = ({ tarea: s, onBack: i, canManage: d, onGenerarDanos: c }) => {
    var ue, Ce, he, le;
    const { user: C } = ve(),
      b = Hs(),
      t = Ks(),
      { data: m, isLoading: g } = ya(s.id),
      E = s.estado === 'CONFORME' || s.estado === 'NO_CONFORME',
      p = E || !d,
      A = (j) => {
        const { _extras: I, ...K } = j || {};
        return { resp: K, extras: I || {} };
      },
      [u, M] = _.useState(() => A(s.checklist).resp),
      [w, l] = _.useState(() => A(s.checklist).extras),
      [S, $] = _.useState(s.observaciones || ''),
      [T, x] = _.useState(s.disposicion || '');
    _.useEffect(() => {
      const { resp: j, extras: I } = A(s.checklist);
      (M(j), l(I), $(s.observaciones || ''), x(s.disposicion || ''));
    }, [s.id]);
    const N = (j, I) => M((K) => ({ ...K, [j]: { ...K[j], estado: I } })),
      a = (j, I) => M((K) => ({ ...K, [j]: { ...K[j], nota: I } })),
      o = (j, I) => M((K) => ({ ...K, [j]: { ...K[j], evidencia: I } })),
      f = (j, I) => l((K) => ({ ...K, [j]: I })),
      n = (j = w) => ({ ...u, _extras: j }),
      v = (j) =>
        l((I) => {
          const K = new Set(I.clasificacion || []);
          return (K.has(j) ? K.delete(j) : K.add(j), { ...I, clasificacion: [...K] });
        }),
      h = (m == null ? void 0 : m.categorias) || [],
      L = !!(m != null && m.solo_no_sanitario),
      q = (m == null ? void 0 : m.sin_clasificar) || 0,
      Q = _.useMemo(() => {
        const j = h.filter((I) => (I.params || []).length > 0).map(_t);
        return [...Ca, ...j];
      }, [h]),
      F = _.useMemo(() => Q.flatMap((j) => j.params), [Q]),
      {
        answeredAll: Z,
        hasNo: O,
        faltan: J
      } = _.useMemo(() => {
        var K;
        let j = 0,
          I = !1;
        for (const ae of F) {
          const oe = (K = u[ae.id]) == null ? void 0 : K.estado;
          (oe && j++, oe === 'NO' && (I = !0));
        }
        return { answeredAll: j === F.length, hasNo: I, faltan: F.length - j };
      }, [u, F]),
      X = async () => {
        if (
          confirm(
            '¿Firmar digitalmente este documento? Quedará sellado y verificable por folio/QR. No se puede deshacer.'
          )
        )
          try {
            const j = await t.mutateAsync(s.id);
            R.success(
              `Documento firmado digitalmente por ${(j == null ? void 0 : j.firmado_nombre) || ''}`
            );
          } catch (j) {
            R.error(`No se pudo firmar: ${j.message}`);
          }
      },
      ee = async (j) => {
        try {
          const I = { categorias: h, soloNoSanitario: L };
          if (j === 'pdf') {
            const K = w.evidencias || [],
              ae = [];
            for (const oe of K)
              try {
                const ge = await ls(Te, oe.path);
                if (!ge) continue;
                const we = await fetch(ge).then((Ee) => (Ee.ok ? Ee.blob() : null));
                if (!we || !/image\/(jpeg|png)/.test(we.type)) continue;
                const Pe = await new Promise((Ee, be) => {
                  const Me = new FileReader();
                  ((Me.onload = () => Ee(Me.result)), (Me.onerror = be), Me.readAsDataURL(we));
                });
                ae.push({ tipo: oe.tipo, dataUrl: Pe });
              } catch {}
            ((I.evidenciasImg = ae), await oa(s, Q, I));
          } else await ta(s, Q, I);
        } catch (I) {
          R.error(`No se pudo generar el documento: ${I.message}`);
        }
      },
      D = async () => {
        try {
          (await b.mutateAsync({
            tareaId: s.id,
            checklist: n(),
            observaciones: S,
            disposicion: T,
            finalizar: !1
          }),
            R.success('Avance guardado'));
        } catch (j) {
          R.error(`No se pudo guardar: ${j.message}`);
        }
      },
      H = async () => {
        if (g) {
          R.error('Cargando las familias de producto de la recepción…');
          return;
        }
        if (!Z) {
          R.error(`Faltan ${J} ítem(s) por responder`);
          return;
        }
        const j = O ? 'NO_CONFORME' : 'CONFORME';
        if (j === 'NO_CONFORME' && !T) {
          R.error('Selecciona la Disposición / Acción a tomar antes de finalizar');
          return;
        }
        if (j === 'NO_CONFORME' && !w.disposicionInmediata) {
          R.error('Marca la Disposición inmediata de la recepción (cuarentena, rechazo, etc.)');
          return;
        }
        if (
          confirm(
            j === 'CONFORME'
              ? 'Todos los ítems conformes → se CERTIFICARÁ automáticamente (se emite folio CERT-) y la tarea quedará bloqueada. ¿Continuar?'
              : `Hay ítems NO conformes → se marcará NO CONFORME (folio ACTA-), disposición "${T}", y se generará la tarea urgente del Informe de Daños. ¿Continuar?`
          )
        )
          try {
            const I = await b.mutateAsync({
              tareaId: s.id,
              checklist: n(),
              observaciones: S,
              disposicion: T,
              finalizar: !0,
              resultado: j
            });
            j === 'CONFORME'
              ? (R.success(
                  `Certificado automáticamente ${(I == null ? void 0 : I.folio) || ''} — recepción CONFORME`
                ),
                i())
              : R.warning('Recepción NO CONFORME. Tarea urgente del Informe de Daños generada.');
          } catch (I) {
            R.error(`No se pudo finalizar: ${I.message}`);
          }
      },
      Y = ({ pid: j, val: I, icon: K, activeCls: ae }) => {
        var ge;
        const oe = ((ge = u[j]) == null ? void 0 : ge.estado) === I;
        return e.jsx('button', {
          type: 'button',
          disabled: p,
          onClick: () => N(j, I),
          className: `w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shrink-0
          ${oe ? ae : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'} ${p ? 'opacity-60 cursor-default' : ''}`,
          children: K
        });
      },
      W = Se[s.estado] || {},
      y = _.useMemo(() => xs({ ...u, _extras: w }), [u, w]),
      U = _.useMemo(() => ms({ ...s, checklist: { ...u, _extras: w } }), [u, w, s]),
      r =
        U.minutos ??
        (s.created_at
          ? Math.max(0, Math.round((Date.now() - new Date(s.created_at).getTime()) / 6e4))
          : null),
      B = w.embalaje || {},
      G = Ds.useRef(null),
      [P, re] = _.useState(!1),
      me = typeof navigator < 'u' && navigator.maxTouchPoints > 0,
      [de, ke] = _.useState(null),
      [_e, Ie] = _.useState(!1),
      [k, z] = _.useState({}),
      V = w.evidencias || [];
    _.useEffect(() => {
      let j = !0;
      return (
        is(
          Te,
          V.map((I) => I.path)
        ).then((I) => {
          j && z(I);
        }),
        () => {
          j = !1;
        }
      );
    }, [JSON.stringify(V.map((j) => j.path))]);
    const se = (j, I = 'galeria') => {
        var K;
        (ke(j), I === 'camara' ? re(!0) : (K = G.current) == null || K.click());
      },
      te = async (j) => {
        var K;
        const I = Array.from(j.target.files || []);
        if (((j.target.value = ''), !(!I.length || !de))) {
          Ie(!0);
          try {
            const ae = [];
            for (const oe of I) {
              if (!oe.type.startsWith('image/')) continue;
              const ge = await _s(oe),
                we = await Sa({ tareaId: s.id, tipo: de, blob: ge });
              ae.push({ tipo: de, path: we, subido_en: new Date().toISOString() });
            }
            if (ae.length) {
              const oe = { ...w, evidencias: [...V, ...ae] };
              (l(oe),
                await b.mutateAsync({
                  tareaId: s.id,
                  checklist: n(oe),
                  observaciones: S,
                  disposicion: T,
                  finalizar: !1
                }),
                R.success(ae.length > 1 ? 'Fotos agregadas' : 'Foto agregada'));
            }
          } catch (ae) {
            R.error(
              (K = ae == null ? void 0 : ae.message) != null && K.includes('row-level security')
                ? 'No tienes permiso para subir fotos'
                : `Error al subir: ${ae.message}`
            );
          } finally {
            (Ie(!1), ke(null));
          }
        }
      },
      pe = async (j) => {
        if (confirm('¿Eliminar esta foto?'))
          try {
            await Js(j.path);
            const I = { ...w, evidencias: V.filter((K) => K.path !== j.path) };
            (l(I),
              await b.mutateAsync({
                tareaId: s.id,
                checklist: n(I),
                observaciones: S,
                disposicion: T,
                finalizar: !1
              }),
              R.success('Foto eliminada'));
          } catch {
            R.error('No se pudo eliminar la foto');
          }
      };
    return e.jsxs('div', {
      children: [
        e.jsxs('button', {
          onClick: i,
          className:
            'flex items-center gap-2 text-slate-500 font-bold text-sm mb-4 hover:text-slate-800',
          children: [e.jsx(Le, { size: 18 }), ' Volver a la cola']
        }),
        e.jsxs('div', {
          className:
            'bg-white rounded-2xl border border-slate-200 p-5 mb-4 flex flex-wrap items-center justify-between gap-3',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsx('div', {
                  className:
                    'w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600',
                  children: e.jsx(ns, { size: 26 })
                }),
                e.jsxs('div', {
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-2 flex-wrap',
                      children: [
                        e.jsx('span', {
                          className: 'font-black text-slate-900',
                          children: s.proveedor || 'Sin proveedor'
                        }),
                        e.jsx('span', {
                          className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${((ue = ts[s.origen]) == null ? void 0 : ue.cls) || ''}`,
                          children: ((Ce = ts[s.origen]) == null ? void 0 : Ce.label) || s.origen
                        }),
                        e.jsx('span', {
                          className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${W.cls || ''}`,
                          children: W.label || s.estado
                        })
                      ]
                    }),
                    e.jsxs('p', {
                      className:
                        'text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-3',
                      children: [
                        e.jsxs('span', {
                          className: 'flex items-center gap-1',
                          children: [e.jsx(Je, { size: 12 }), ' OC ', s.oc || '—']
                        }),
                        e.jsxs('span', {
                          className: 'flex items-center gap-1',
                          children: [e.jsx($s, { size: 12 }), ' ', s.fecha_recepcion || '—']
                        }),
                        s.bultos != null &&
                          e.jsxs('span', { children: ['· ', s.bultos, ' bultos'] }),
                        ((he = s.contexto) == null ? void 0 : he.pallets) != null &&
                          e.jsxs('span', { children: ['· ', s.contexto.pallets, ' pallets'] }),
                        ((le = s.contexto) == null ? void 0 : le.tipo_contenedor) &&
                          e.jsxs('span', { children: ['· ', s.contexto.tipo_contenedor] })
                      ]
                    })
                  ]
                })
              ]
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                s.folio &&
                  e.jsxs('div', {
                    className: 'text-right',
                    children: [
                      e.jsx('p', {
                        className:
                          'text-[10px] font-black text-emerald-500 uppercase tracking-widest',
                        children: 'Certificado'
                      }),
                      e.jsx('p', {
                        className: 'font-mono font-black text-emerald-700',
                        children: s.folio
                      })
                    ]
                  }),
                e.jsxs('div', {
                  className: 'flex gap-2',
                  children: [
                    e.jsxs('button', {
                      onClick: () => ee('pdf'),
                      title: 'Descargar PDF',
                      className:
                        'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                      children: [e.jsx(Ts, { size: 15 }), ' PDF']
                    }),
                    e.jsxs('button', {
                      onClick: () => ee('word'),
                      title: 'Descargar Word',
                      className:
                        'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                      children: [e.jsx(Oe, { size: 15 }), ' Word']
                    })
                  ]
                })
              ]
            })
          ]
        }),
        s.firma_digital
          ? e.jsxs('div', {
              className:
                'bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex items-start gap-3',
              children: [
                e.jsx(Ls, { size: 22, className: 'text-emerald-600 shrink-0 mt-0.5' }),
                e.jsxs('div', {
                  className: 'text-sm min-w-0',
                  children: [
                    e.jsx('p', {
                      className: 'font-black text-emerald-800',
                      children: 'Firmado digitalmente'
                    }),
                    e.jsxs('p', {
                      className: 'text-emerald-700 text-xs',
                      children: [
                        s.firmado_nombre || '—',
                        ' ·',
                        ' ',
                        s.firmado_en ? new Date(s.firmado_en).toLocaleString('es-CL') : '',
                        ' ·',
                        ' ',
                        s.firma_algoritmo
                      ]
                    }),
                    e.jsxs('p', {
                      className: 'text-[10px] font-mono text-emerald-500 break-all mt-0.5',
                      children: [(s.firma_digital || '').slice(0, 40), '…']
                    })
                  ]
                })
              ]
            })
          : E && d
            ? e.jsxs('div', {
                className:
                  'bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3',
                children: [
                  e.jsxs('div', {
                    className: 'text-sm text-slate-600 flex items-center gap-2',
                    children: [
                      e.jsx(Ve, { size: 18, className: 'text-slate-400' }),
                      ' Documento sin firmar.'
                    ]
                  }),
                  e.jsxs('button', {
                    onClick: X,
                    disabled: t.isPending,
                    className:
                      'px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50',
                    children: [e.jsx(Ve, { size: 16 }), ' Firmar digitalmente']
                  })
                ]
              })
            : null,
        e.jsxs('div', {
          className: 'bg-white rounded-2xl border border-slate-200 p-5 mb-4',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-2 mb-3',
              children: [
                e.jsx(ca, { size: 16, className: 'text-slate-400' }),
                e.jsx('h3', {
                  className: 'text-sm font-black text-slate-800',
                  children: 'Familias de producto de la recepción'
                }),
                g && e.jsx(ne, { size: 14, className: 'animate-spin text-slate-300' })
              ]
            }),
            h.length === 0
              ? e.jsx('p', {
                  className: 'text-xs text-slate-400',
                  children: g
                    ? 'Detectando familias…'
                    : 'Sin ítems clasificables en la recepción. Se aplican solo los controles universales.'
                })
              : e.jsx('div', {
                  className: 'flex flex-wrap gap-2',
                  children: h.map((j) => {
                    var I;
                    return e.jsxs(
                      'span',
                      {
                        className: `text-[11px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${((I = Ea[j.codigo]) == null ? void 0 : I.cls) || 'bg-slate-100 text-slate-600 border-slate-200'}`,
                        title: j.descripcion || '',
                        children: [
                          j.label,
                          ' · ',
                          j.items,
                          j.clase_riesgo &&
                            e.jsxs('span', {
                              className: 'opacity-70',
                              children: ['Clase ', j.clase_riesgo]
                            }),
                          !j.es_dispositivo_medico &&
                            e.jsx('span', { className: 'opacity-70', children: '· no sanitario' })
                        ]
                      },
                      j.codigo
                    );
                  })
                }),
            (m == null ? void 0 : m.requiere_registro_isp) &&
              e.jsxs('p', {
                className:
                  'mt-3 text-[11px] text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg px-3 py-2 flex items-start gap-1.5',
                children: [
                  e.jsx(ys, { size: 13, className: 'mt-0.5 shrink-0' }),
                  'Contiene insumos de posible ',
                  e.jsx('b', { children: 'control obligatorio ISP' }),
                  ' (jeringas, agujas, guantes, preservativos): verifique el ',
                  e.jsx('b', { children: 'N° de registro sanitario' }),
                  ' en la sección de insumo estéril.'
                ]
              }),
            L &&
              e.jsxs('p', {
                className:
                  'mt-3 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-start gap-1.5',
                children: [
                  e.jsx(ys, { size: 13, className: 'mt-0.5 shrink-0' }),
                  'Recepción de ',
                  e.jsx('b', { children: 'producto no sanitario' }),
                  ' (bienestar / empaque). El documento se emite como conformidad de recepción,',
                  ' ',
                  e.jsx('b', { children: 'no como certificado de dispositivo médico ISO 13485' }),
                  '.'
                ]
              }),
            q > 0 &&
              e.jsxs('p', {
                className:
                  'mt-3 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 flex items-start gap-1.5',
                children: [
                  e.jsx(xe, { size: 13, className: 'mt-0.5 shrink-0' }),
                  q,
                  ' ítem(s) ',
                  e.jsx('b', { children: 'sin clasificar' }),
                  ' (sin descripción o familia desconocida): solo se aplican los controles universales; revise su clasificación.'
                ]
              })
          ]
        }),
        e.jsxs('div', {
          className: 'bg-white rounded-2xl border border-slate-200 p-5 mb-4',
          children: [
            e.jsxs('h3', {
              className: 'text-sm font-black text-slate-800 mb-3 flex items-center gap-2',
              children: [
                e.jsx($e, { size: 16, className: 'text-slate-400' }),
                ' Clasificación del producto'
              ]
            }),
            e.jsx('div', {
              className: 'flex flex-wrap gap-2',
              children: cs.map((j) => {
                const I = (w.clasificacion || []).includes(j.id);
                return e.jsxs(
                  'button',
                  {
                    type: 'button',
                    disabled: p,
                    onClick: () => v(j.id),
                    className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${I ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'}`,
                    children: [I ? '☑' : '☐', ' ', j.label]
                  },
                  j.id
                );
              })
            })
          ]
        }),
        e.jsxs('div', {
          className: 'bg-white rounded-2xl border border-slate-200 p-5 mb-4',
          children: [
            e.jsxs('div', {
              className: 'flex items-center justify-between gap-3 flex-wrap mb-3',
              children: [
                e.jsxs('h3', {
                  className: 'text-sm font-black text-slate-800 flex items-center gap-2',
                  children: [
                    e.jsx($e, { size: 16, className: 'text-slate-400' }),
                    ' Evaluación del embalaje'
                  ]
                }),
                e.jsxs('span', {
                  className: `text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${y.cls}`,
                  children: [y.emoji, ' ', y.label]
                })
              ]
            }),
            !p &&
              e.jsxs('div', {
                className: 'flex flex-wrap items-center gap-2 mb-3',
                children: [
                  e.jsx('span', {
                    className: 'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                    children: 'Aplicar a todos:'
                  }),
                  e.jsxs('button', {
                    type: 'button',
                    onClick: () => f('embalaje', { ...B, ...ks.conforme }),
                    className:
                      'px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-black hover:bg-emerald-100 inline-flex items-center gap-1.5',
                    children: [e.jsx(ze, { size: 13 }), ' Todo conforme']
                  }),
                  e.jsxs('button', {
                    type: 'button',
                    onClick: () => f('embalaje', { ...B, ...ks.sinPallet }),
                    className:
                      'px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs font-black hover:bg-slate-100 inline-flex items-center gap-1.5',
                    children: [e.jsx(es, { size: 13 }), ' Sin pallet / film (N/A)']
                  }),
                  e.jsx('button', {
                    type: 'button',
                    onClick: () => f('embalaje', {}),
                    className:
                      'px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 text-xs font-bold hover:text-slate-600',
                    children: 'Limpiar'
                  })
                ]
              }),
            e.jsx('div', {
              className: 'space-y-2.5',
              children: ds.map((j) =>
                e.jsxs(
                  'div',
                  {
                    className:
                      'flex items-center justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0 flex-wrap',
                    children: [
                      e.jsx('p', {
                        className: 'text-sm text-slate-700 font-semibold',
                        children: j.label
                      }),
                      e.jsx('div', {
                        className: 'flex gap-1.5 flex-wrap',
                        children: j.opciones.map((I) => {
                          const K = B[j.id] === I,
                            ae =
                              ['Malo', 'Incorrecto', 'Sí'].includes(I) ||
                              (j.id === 'pallet' && I === 'Regular'),
                            oe = I === Oa;
                          return e.jsx(
                            'button',
                            {
                              type: 'button',
                              disabled: p,
                              onClick: () => f('embalaje', { ...B, [j.id]: K ? void 0 : I }),
                              className: `px-3 py-1.5 rounded-lg border text-xs font-black transition-colors ${K ? (oe ? 'bg-slate-400 border-slate-400 text-white' : ae ? 'bg-rose-500 border-rose-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white') : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`,
                              children: I
                            },
                            I
                          );
                        })
                      })
                    ]
                  },
                  j.id
                )
              )
            }),
            e.jsx('p', {
              className: 'text-[10px] text-slate-400 mt-2',
              children:
                'El indicador de riesgo se calcula solo: embalaje dañado y no conformidades del checklist suben el nivel.'
            })
          ]
        }),
        e.jsxs('div', {
          className: 'space-y-4',
          children: [
            Q.map((j) =>
              e.jsxs(
                'div',
                {
                  className: `bg-white rounded-2xl border p-5 ${j.categoria ? 'border-emerald-200' : 'border-slate-200'}`,
                  children: [
                    e.jsxs('h3', {
                      className: 'text-sm font-black text-slate-800 mb-3 flex items-center gap-2',
                      children: [
                        j.categoria &&
                          e.jsx(da, { size: 14, className: 'text-emerald-500 shrink-0' }),
                        j.titulo
                      ]
                    }),
                    e.jsx('div', {
                      className: 'space-y-2.5',
                      children: j.params.map((I) => {
                        var K, ae, oe, ge, we, Pe, Ee;
                        return e.jsxs(
                          'div',
                          {
                            className:
                              'flex items-start gap-3 py-1.5 border-b border-slate-50 last:border-0',
                            children: [
                              e.jsxs('div', {
                                className: 'flex-1 min-w-0',
                                children: [
                                  e.jsx('p', {
                                    className: 'text-sm text-slate-700 font-semibold',
                                    children: I.label
                                  }),
                                  ((K = u[I.id]) == null ? void 0 : K.estado) &&
                                    e.jsxs('div', {
                                      className: 'mt-1.5 flex items-center gap-1.5',
                                      children: [
                                        e.jsx('span', {
                                          className:
                                            'text-[10px] font-black text-slate-400 uppercase',
                                          children: 'Evidencia:'
                                        }),
                                        e.jsxs('select', {
                                          value:
                                            ((ae = u[I.id]) == null ? void 0 : ae.evidencia) || '',
                                          disabled: p,
                                          onChange: (be) => o(I.id, be.target.value),
                                          className: `px-2 py-1 rounded-lg border text-[11px] font-bold ${(oe = u[I.id]) != null && oe.evidencia ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 text-slate-400'}`,
                                          children: [
                                            e.jsx('option', {
                                              value: '',
                                              children: '— cómo se verificó —'
                                            }),
                                            qs.map((be) =>
                                              e.jsx('option', { value: be, children: be }, be)
                                            )
                                          ]
                                        })
                                      ]
                                    }),
                                  ((ge = u[I.id]) == null ? void 0 : ge.estado) === 'NO' &&
                                    e.jsx('input', {
                                      value: ((we = u[I.id]) == null ? void 0 : we.nota) || '',
                                      disabled: p,
                                      onChange: (be) => a(I.id, be.target.value),
                                      placeholder: 'Detalle de la no conformidad…',
                                      className:
                                        'mt-1.5 w-full px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/40 text-xs outline-none focus:border-rose-400'
                                    }),
                                  ((Pe = u[I.id]) == null ? void 0 : Pe.estado) === 'NA' &&
                                    e.jsx('input', {
                                      value: ((Ee = u[I.id]) == null ? void 0 : Ee.nota) || '',
                                      disabled: p,
                                      onChange: (be) => a(I.id, be.target.value),
                                      placeholder:
                                        'Justificación del N/A (recomendada para auditoría ISO)…',
                                      className:
                                        'mt-1.5 w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs outline-none focus:border-slate-400'
                                    })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'flex items-center gap-1.5',
                                children: [
                                  e.jsx(Y, {
                                    pid: I.id,
                                    val: 'OK',
                                    icon: e.jsx(ze, { size: 16 }),
                                    activeCls: 'bg-emerald-500 border-emerald-500 text-white'
                                  }),
                                  e.jsx(Y, {
                                    pid: I.id,
                                    val: 'NO',
                                    icon: e.jsx(Re, { size: 16 }),
                                    activeCls: 'bg-rose-500 border-rose-500 text-white'
                                  }),
                                  e.jsx(Y, {
                                    pid: I.id,
                                    val: 'NA',
                                    icon: e.jsx(es, { size: 16 }),
                                    activeCls: 'bg-slate-400 border-slate-400 text-white'
                                  })
                                ]
                              })
                            ]
                          },
                          I.id
                        );
                      })
                    })
                  ]
                },
                j.nivel
              )
            ),
            e.jsxs('div', {
              className: `bg-white rounded-2xl border p-5 ${O && !w.disposicionInmediata ? 'border-rose-200' : 'border-slate-200'}`,
              children: [
                e.jsxs('label', {
                  className: `text-[10px] font-black uppercase tracking-widest ${O && !w.disposicionInmediata ? 'text-rose-500' : 'text-slate-400'}`,
                  children: [
                    'Disposición inmediata ',
                    O && e.jsx('span', { children: '*obligatoria (hay no conformes)' })
                  ]
                }),
                e.jsx('div', {
                  className: 'flex flex-wrap gap-2 mt-2',
                  children: ka.map((j) => {
                    const I = w.disposicionInmediata === j,
                      K = ['Cuarentena', 'Rechazo proveedor', 'Devuelto'].includes(j);
                    return e.jsxs(
                      'button',
                      {
                        type: 'button',
                        disabled: p,
                        onClick: () => f('disposicionInmediata', I ? void 0 : j),
                        className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${I ? (K ? 'bg-rose-500 border-rose-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white') : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`,
                        children: [I ? '☑' : '☐', ' ', j]
                      },
                      j
                    );
                  })
                })
              ]
            }),
            (O || T) &&
              e.jsxs('div', {
                className: `rounded-2xl border p-5 ${O ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'}`,
                children: [
                  e.jsxs('label', {
                    className:
                      'text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-rose-500',
                    children: [
                      'Disposición / Acción a tomar ',
                      O && e.jsx('span', { children: '*obligatoria' })
                    ]
                  }),
                  e.jsxs('select', {
                    value: T,
                    disabled: p,
                    onChange: (j) => x(j.target.value),
                    className:
                      'mt-1.5 w-full px-3 py-2 rounded-xl border border-rose-200 text-sm font-bold outline-none focus:border-rose-400 bg-white',
                    children: [
                      e.jsx('option', { value: '', children: '— Seleccionar disposición —' }),
                      e.jsx('option', {
                        value: 'Rechazar y devolver al proveedor',
                        children: 'Rechazar y devolver al proveedor'
                      }),
                      e.jsx('option', {
                        value: 'Cuarentena (retención para evaluación)',
                        children: 'Cuarentena (retención para evaluación)'
                      }),
                      e.jsx('option', {
                        value: 'Aceptar con salvedades',
                        children: 'Aceptar con salvedades'
                      }),
                      e.jsx('option', {
                        value: 'Reproceso / reacondicionamiento',
                        children: 'Reproceso / reacondicionamiento'
                      }),
                      e.jsx('option', {
                        value: 'Solicitud de No Conformidad (NC) al proveedor',
                        children: 'Solicitud de No Conformidad (NC) al proveedor'
                      })
                    ]
                  })
                ]
              }),
            e.jsxs('div', {
              className: 'bg-white rounded-2xl border border-slate-200 p-5',
              children: [
                e.jsx('label', {
                  className: 'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                  children: 'Observaciones generales'
                }),
                e.jsx('textarea', {
                  value: S,
                  disabled: p,
                  onChange: (j) => $(j.target.value),
                  rows: 2,
                  placeholder: 'Notas del checklist…',
                  className:
                    'mt-1.5 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 resize-none'
                })
              ]
            }),
            e.jsxs('div', {
              className: 'bg-white rounded-2xl border border-slate-200 p-5',
              children: [
                e.jsxs('h3', {
                  className: 'text-sm font-black text-slate-800 mb-3 flex items-center gap-2',
                  children: [
                    e.jsx(De, { size: 16, className: 'text-slate-400' }),
                    ' Evidencia fotográfica'
                  ]
                }),
                e.jsx('div', {
                  className: 'grid sm:grid-cols-2 lg:grid-cols-4 gap-3',
                  children: Aa.map((j) => {
                    const I = V.filter((K) => K.tipo === j.id);
                    return e.jsxs(
                      'div',
                      {
                        className: 'rounded-xl border border-slate-100 p-3',
                        children: [
                          e.jsxs('p', {
                            className:
                              'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2',
                            children: ['📷 ', j.label, ' (', I.length, ')']
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2 flex-wrap',
                            children: [
                              I.map((K) =>
                                e.jsxs(
                                  'div',
                                  {
                                    className:
                                      'relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0',
                                    children: [
                                      e.jsx('a', {
                                        href: k[K.path] || '#',
                                        target: '_blank',
                                        rel: 'noreferrer',
                                        children: e.jsx('img', {
                                          src: k[K.path] || '',
                                          alt: j.label,
                                          className: 'w-full h-full object-cover'
                                        })
                                      }),
                                      !p &&
                                        e.jsx('button', {
                                          onClick: () => pe(K),
                                          title: 'Eliminar foto',
                                          className:
                                            'absolute top-0.5 right-0.5 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity',
                                          children: e.jsx(ie, { size: 11 })
                                        })
                                    ]
                                  },
                                  K.path
                                )
                              ),
                              !p &&
                                me &&
                                e.jsxs('button', {
                                  type: 'button',
                                  onClick: () => se(j.id, 'camara'),
                                  disabled: _e,
                                  title: 'Tomar foto con la cámara',
                                  className:
                                    'w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-emerald-300 text-emerald-500 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40',
                                  children: [
                                    _e && de === j.id
                                      ? e.jsx(Ne, { size: 16, className: 'animate-spin' })
                                      : e.jsx(De, { size: 16 }),
                                    e.jsx('span', {
                                      className: 'text-[8px] font-black uppercase',
                                      children: 'Cámara'
                                    })
                                  ]
                                }),
                              !p &&
                                e.jsxs('button', {
                                  type: 'button',
                                  onClick: () => se(j.id, 'galeria'),
                                  disabled: _e,
                                  title: 'Subir foto desde archivos/galería',
                                  className:
                                    'w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40',
                                  children: [
                                    _e && de === j.id
                                      ? e.jsx(Ne, { size: 16, className: 'animate-spin' })
                                      : e.jsx(rs, { size: 16 }),
                                    e.jsx('span', {
                                      className: 'text-[8px] font-black uppercase',
                                      children: me ? 'Galería' : 'Foto'
                                    })
                                  ]
                                }),
                              I.length === 0 &&
                                p &&
                                e.jsx('span', {
                                  className: 'text-xs text-slate-300',
                                  children: 'Sin fotos'
                                })
                            ]
                          })
                        ]
                      },
                      j.id
                    );
                  })
                }),
                e.jsx('input', {
                  ref: G,
                  type: 'file',
                  accept: 'image/*',
                  multiple: !0,
                  onChange: te,
                  className: 'hidden'
                }),
                P &&
                  e.jsx(ws, {
                    onCapture: (j) => te({ target: { files: [j], value: '' } }),
                    onClose: () => re(!1)
                  }),
                e.jsx('p', {
                  className: 'text-[10px] text-slate-400 mt-2',
                  children: 'Las fotos quedan asociadas al checklist (bucket privado).'
                })
              ]
            }),
            e.jsxs('div', {
              className: 'bg-white rounded-2xl border border-slate-200 p-5',
              children: [
                e.jsx('h3', {
                  className: 'text-sm font-black text-slate-800 mb-3',
                  children: 'Indicadores ISO'
                }),
                e.jsx('div', {
                  className: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3',
                  children: [
                    ['Tiempo recepción', r != null ? `${r} min` : '—'],
                    ['Inspector', U.inspector || (C == null ? void 0 : C.nombre) || '—'],
                    ['N° ítems', U.items || 0],
                    ['Conformes', U.ok || 0],
                    ['No conformes', U.no || 0],
                    ['Resultado', U.pct != null ? `${String(U.pct).replace('.', ',')}%` : '—']
                  ].map(([j, I]) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'rounded-xl border border-slate-100 bg-slate-50/60 p-3',
                        children: [
                          e.jsx('div', {
                            className:
                              'text-[10px] font-black text-slate-400 uppercase tracking-wide',
                            children: j
                          }),
                          e.jsx('div', {
                            className: `text-lg font-black ${j === 'No conformes' && U.no > 0 ? 'text-rose-600' : 'text-slate-900'} truncate`,
                            title: String(I),
                            children: I
                          })
                        ]
                      },
                      j
                    )
                  )
                })
              ]
            })
          ]
        }),
        !p &&
          e.jsxs('div', {
            className:
              'sticky bottom-3 mt-5 bg-white rounded-2xl border border-slate-200 shadow-lg p-4 flex flex-wrap items-center justify-between gap-3',
            children: [
              e.jsx('div', {
                className: 'text-xs font-black',
                children:
                  J > 0
                    ? e.jsxs('span', {
                        className: 'text-slate-500',
                        children: [J, ' ítem(s) por responder']
                      })
                    : O
                      ? e.jsx('span', {
                          className: 'text-rose-600',
                          children: 'Resultado automático: NO CONFORME'
                        })
                      : e.jsx('span', {
                          className: 'text-emerald-600',
                          children: 'Resultado automático: CONFORME'
                        })
              }),
              e.jsxs('div', {
                className: 'flex flex-wrap gap-2',
                children: [
                  e.jsx('button', {
                    onClick: D,
                    disabled: b.isPending,
                    className:
                      'px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50',
                    children: 'Guardar avance'
                  }),
                  e.jsx('button', {
                    onClick: H,
                    disabled: b.isPending || J > 0,
                    className: `px-4 py-2.5 rounded-xl text-white font-black text-sm flex items-center gap-2 disabled:opacity-40 ${O ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`,
                    children: O
                      ? e.jsxs(e.Fragment, {
                          children: [e.jsx(Cs, { size: 16 }), ' Finalizar (No Conforme)']
                        })
                      : e.jsxs(e.Fragment, {
                          children: [e.jsx(We, { size: 16 }), ' Finalizar y certificar']
                        })
                  })
                ]
              })
            ]
          }),
        s.estado === 'NO_CONFORME' &&
          e.jsxs('div', {
            className:
              'mt-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3',
            children: [
              e.jsxs('span', {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(xe, { size: 16 }),
                  ' Recepción ',
                  e.jsx('b', { children: 'NO CONFORME' }),
                  '. Requiere Informe de Daños / Solicitud NC al proveedor.'
                ]
              }),
              c &&
                e.jsxs('button', {
                  onClick: () => c(s),
                  className:
                    'px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center gap-2 hover:bg-rose-700 shrink-0',
                  children: [e.jsx(Cs, { size: 16 }), ' Generar Informe de Daños']
                })
            ]
          })
      ]
    });
  },
  yt = ({ onGenerarDanos: s }) => {
    const { hasPermission: i, user: d } = ve(),
      c = i('manage_quality') || i('manage_monitoreo'),
      C = (d == null ? void 0 : d.rol) === 'ADMIN' || (d == null ? void 0 : d.es_admin_delegado),
      { data: b = [], isLoading: t, refetch: m, isFetching: g } = wa(),
      E = Vs(),
      [p, A] = _.useState(null),
      [u, M] = _.useState(''),
      [w, l] = _.useState('TODOS'),
      S = async (N, a) => {
        if (
          (a.stopPropagation(),
          !!confirm(
            `¿Eliminar la tarea de ${N.proveedor || 'recepción'} (OC ${N.oc || '—'})? Esta acción no se puede deshacer.`
          ))
        )
          try {
            (await E.mutateAsync(N.id), R.success('Tarea eliminada'));
          } catch (o) {
            R.error(`No se pudo eliminar: ${o.message}`);
          }
      },
      $ = b.filter((N) => N.estado === 'PENDIENTE' || N.estado === 'EN_PROCESO').length,
      T = _.useMemo(() => {
        const N = u.trim().toLocaleLowerCase('es-CL');
        return b.filter(
          (a) =>
            (!N ||
              [a.oc, a.proveedor, a.folio, a.origen].some((f) =>
                String(f || '')
                  .toLocaleLowerCase('es-CL')
                  .includes(N)
              )) &&
            (w === 'TODOS' || a.estado === w)
        );
      }, [u, w, b]),
      x = p ? b.find((N) => N.id === p.id) || p : null;
    return x
      ? e.jsx(wt, { tarea: x, onBack: () => A(null), canManage: c, onGenerarDanos: s })
      : e.jsxs('div', {
          children: [
            e.jsxs('div', {
              className:
                'mb-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 shadow-sm',
              children: [
                e.jsxs('div', {
                  className: 'flex flex-wrap items-start justify-between gap-3',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('p', {
                          className:
                            'text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600',
                          children: 'Hito 1 · Recepción'
                        }),
                        e.jsx('h2', {
                          className: 'mt-0.5 text-lg font-black text-slate-900',
                          children: 'Bandeja de checklists'
                        }),
                        e.jsx('p', {
                          className: 'text-xs text-slate-500',
                          children: 'Localiza una recepción por OC, proveedor o folio.'
                        })
                      ]
                    }),
                    e.jsxs('button', {
                      onClick: () => m(),
                      disabled: g,
                      className:
                        'px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                      children: [
                        e.jsx(Ne, { size: 14, className: g ? 'animate-spin' : '' }),
                        ' Actualizar'
                      ]
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2',
                  children: [
                    e.jsx(Ye, { label: 'Total', value: b.length, tone: 'slate' }),
                    e.jsx(Ye, { label: 'Por revisar', value: $, tone: 'amber' }),
                    e.jsx(Ye, { label: 'Finalizadas', value: b.length - $, tone: 'emerald' })
                  ]
                }),
                e.jsxs('div', {
                  className: 'mt-4 flex flex-col lg:flex-row gap-2',
                  children: [
                    e.jsxs('label', {
                      className: 'relative flex-1',
                      children: [
                        e.jsx(ce, {
                          size: 16,
                          className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                        }),
                        e.jsx('input', {
                          value: u,
                          onChange: (N) => M(N.target.value),
                          placeholder: 'Buscar OC, nombre de proveedor o folio…',
                          className:
                            'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'
                        })
                      ]
                    }),
                    e.jsx('div', {
                      className: 'flex gap-1 overflow-x-auto pb-0.5',
                      children: ['TODOS', 'PENDIENTE', 'EN_PROCESO', 'CONFORME', 'NO_CONFORME'].map(
                        (N) => {
                          var a;
                          return e.jsx(
                            'button',
                            {
                              onClick: () => l(N),
                              className: `whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-black tracking-wide transition ${w === N ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-200'}`,
                              children:
                                N === 'TODOS'
                                  ? 'Todos'
                                  : ((a = Se[N]) == null ? void 0 : a.label) || N
                            },
                            N
                          );
                        }
                      )
                    })
                  ]
                }),
                !t &&
                  e.jsxs('p', {
                    className: 'mt-2 text-[11px] font-bold text-slate-400',
                    children: ['Mostrando ', T.length, ' de ', b.length, ' recepciones.']
                  })
              ]
            }),
            t
              ? e.jsx('div', {
                  className: 'flex justify-center py-20',
                  children: e.jsx(ne, { className: 'animate-spin text-emerald-500', size: 36 })
                })
              : b.length === 0
                ? e.jsxs('div', {
                    className: 'flex flex-col items-center justify-center py-20 text-center',
                    children: [
                      e.jsx(ns, { size: 44, className: 'text-slate-200 mb-4' }),
                      e.jsx('h3', {
                        className: 'text-base font-bold text-slate-400',
                        children: 'Sin tareas de checklist'
                      }),
                      e.jsx('p', {
                        className: 'text-xs text-slate-300',
                        children:
                          'Las tareas se generan solas al registrar una recepción. Usa “Actualizar” si acabas de registrar una.'
                      })
                    ]
                  })
                : T.length === 0
                  ? e.jsxs('div', {
                      className:
                        'rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center',
                      children: [
                        e.jsx(ce, { size: 34, className: 'mx-auto mb-3 text-slate-300' }),
                        e.jsx('h3', {
                          className: 'font-bold text-slate-500',
                          children: 'No hay coincidencias'
                        }),
                        e.jsx('button', {
                          onClick: () => {
                            (M(''), l('TODOS'));
                          },
                          className:
                            'mt-2 text-xs font-black text-emerald-600 hover:text-emerald-700',
                          children: 'Limpiar filtros'
                        })
                      ]
                    })
                  : e.jsx('div', {
                      className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
                      children: T.map((N) => {
                        var n, v, h;
                        const a = Se[N.estado] || {},
                          o = ts[N.origen] || {},
                          f = N.estado === 'PENDIENTE' || N.estado === 'EN_PROCESO';
                        return e.jsxs(
                          'div',
                          {
                            role: 'button',
                            tabIndex: 0,
                            onClick: () => A(N),
                            className: `cursor-pointer text-left bg-white rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${f ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-emerald-300'}`,
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center justify-between mb-3 gap-2',
                                children: [
                                  e.jsxs('span', {
                                    className:
                                      'flex items-center gap-1.5 font-black text-slate-900 truncate',
                                    children: [
                                      e.jsx($e, { size: 16, className: 'text-slate-400 shrink-0' }),
                                      N.proveedor || 'Sin proveedor'
                                    ]
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-1.5 shrink-0',
                                    children: [
                                      e.jsx('span', {
                                        className: `text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${a.cls}`,
                                        children: a.label || N.estado
                                      }),
                                      C &&
                                        e.jsx('button', {
                                          onClick: (L) => S(N, L),
                                          title: 'Eliminar (admin)',
                                          className:
                                            'p-1.5 rounded-lg text-slate-300 hover:bg-rose-100 hover:text-rose-600',
                                          children: e.jsx(ie, { size: 14 })
                                        })
                                    ]
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'flex items-center gap-2 mb-2',
                                children: [
                                  e.jsx('span', {
                                    className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${o.cls}`,
                                    children: o.label || N.origen
                                  }),
                                  N.folio &&
                                    e.jsx('span', {
                                      className:
                                        'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-600 border-emerald-200 font-mono',
                                      children: N.folio
                                    })
                                ]
                              }),
                              e.jsxs('p', {
                                className: 'text-sm text-slate-500 font-medium',
                                children: ['OC ', N.oc || '—', ' · ', N.fecha_recepcion || '—']
                              }),
                              (N.bultos != null ||
                                ((n = N.contexto) == null ? void 0 : n.pallets) != null) &&
                                e.jsxs('p', {
                                  className: 'text-xs text-slate-400 mt-1',
                                  children: [
                                    N.bultos != null ? `${N.bultos} bultos` : '',
                                    ((v = N.contexto) == null ? void 0 : v.pallets) != null
                                      ? ` · ${N.contexto.pallets} pallets`
                                      : '',
                                    (h = N.contexto) != null && h.tipo_contenedor
                                      ? ` · ${N.contexto.tipo_contenedor}`
                                      : ''
                                  ]
                                })
                            ]
                          },
                          N.id
                        );
                      })
                    })
          ]
        });
  },
  Ye = ({ label: s, value: i, tone: d }) => {
    const c = {
      slate: 'bg-white text-slate-800 border-slate-200',
      amber: 'bg-amber-50 text-amber-700 border-amber-200',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return e.jsxs('div', {
      className: `rounded-xl border px-3 py-2 ${c[d] || c.slate}`,
      children: [
        e.jsx('p', { className: 'text-lg font-black leading-none', children: i }),
        e.jsx('p', {
          className: 'mt-1 text-[9px] font-black uppercase tracking-widest opacity-70',
          children: s
        })
      ]
    });
  },
  Ct = ({ onClose: s }) => {
    const i = $a(),
      [d, c] = _.useState(''),
      [C, b] = _.useState(!1),
      [t, m] = _.useState([]),
      [g, E] = _.useState([]),
      [p, A] = _.useState(''),
      [u, M] = _.useState('NORMAL'),
      w = _.useCallback(async () => {
        b(!0);
        try {
          m(await bs(d, !1));
        } catch (x) {
          R.error(`Error buscando stock: ${x.message}`);
        } finally {
          b(!1);
        }
      }, [d]),
      l = (x) => `${x.codigo_producto}|${x.partida || ''}|${x.ubicacion || ''}`,
      S = (x) => {
        const N = l(x);
        if (g.some((a) => a._key === N)) {
          R.info('Ese SKU ya está en la asignación');
          return;
        }
        E((a) => [
          ...a,
          {
            _key: N,
            codigo_producto: x.codigo_producto,
            producto: x.producto || '',
            ubicacion: x.ubicacion || '',
            partida: x.partida || '',
            cantidad: Number(x.disponible) || 0,
            unidad_medida: x.unidad_medida || 'UN',
            tipo: x.tipo || 'NO_PERECIBLE',
            fecha_vencimiento: x.fecha_vencimiento || null,
            semaforo: x.semaforo || 'NA'
          }
        ]);
      },
      $ = (x) => E((N) => N.filter((a) => a._key !== x)),
      T = async () => {
        if (g.length === 0) {
          R.error('Elige al menos un SKU');
          return;
        }
        try {
          const x = g.map(({ _key: N, ...a }) => a);
          (await i.mutateAsync({ skus: x, motivo: p, prioridad: u }),
            R.success(`${x.length} SKU(s) asignados a Calidad`),
            s());
        } catch (x) {
          R.error(`No se pudo asignar: ${x.message}`);
        }
      };
    return e.jsx('div', {
      className: 'fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-3',
      onClick: s,
      children: e.jsxs('div', {
        className:
          'bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col',
        onClick: (x) => x.stopPropagation(),
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between p-5 border-b border-slate-100',
            children: [
              e.jsxs('h3', {
                className: 'font-black text-slate-900 flex items-center gap-2',
                children: [
                  e.jsx(ss, { size: 18, className: 'text-emerald-600' }),
                  ' Asignar SKUs a Calidad'
                ]
              }),
              e.jsx('button', {
                onClick: s,
                className: 'p-2 rounded-lg hover:bg-slate-100 text-slate-400',
                children: e.jsx(Re, { size: 18 })
              })
            ]
          }),
          e.jsxs('div', {
            className: 'p-5 overflow-y-auto space-y-4',
            children: [
              e.jsxs('div', {
                className: 'flex gap-2',
                children: [
                  e.jsxs('div', {
                    className:
                      'flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-emerald-400',
                    children: [
                      e.jsx(ce, { size: 16, className: 'text-slate-400' }),
                      e.jsx('input', {
                        value: d,
                        onChange: (x) => c(x.target.value),
                        onKeyDown: (x) => x.key === 'Enter' && w(),
                        placeholder: 'Buscar por SKU, descripción o ubicación…',
                        className: 'flex-1 text-sm outline-none bg-transparent'
                      })
                    ]
                  }),
                  e.jsxs('button', {
                    onClick: w,
                    disabled: C,
                    className:
                      'px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 disabled:opacity-50',
                    children: [
                      C
                        ? e.jsx(ne, { size: 16, className: 'animate-spin' })
                        : e.jsx(ce, { size: 16 }),
                      ' ',
                      'Buscar'
                    ]
                  })
                ]
              }),
              t.length > 0 &&
                e.jsx('div', {
                  className:
                    'border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-52 overflow-y-auto',
                  children: t.map((x, N) =>
                    e.jsxs(
                      'button',
                      {
                        onClick: () => S(x),
                        className:
                          'w-full text-left px-3 py-2 hover:bg-emerald-50/50 flex items-center justify-between gap-2',
                        children: [
                          e.jsxs('span', {
                            className: 'min-w-0',
                            children: [
                              e.jsxs('span', {
                                className: 'font-bold text-sm text-slate-800 truncate block',
                                children: [x.codigo_producto, ' · ', x.producto]
                              }),
                              e.jsxs('span', {
                                className: 'text-xs text-slate-400',
                                children: [
                                  x.ubicacion || 's/ubic',
                                  ' · ',
                                  x.partida || 's/partida',
                                  ' · ',
                                  x.disponible,
                                  ' ',
                                  x.unidad_medida
                                ]
                              })
                            ]
                          }),
                          e.jsx(fe, { size: 16, className: 'text-emerald-500 shrink-0' })
                        ]
                      },
                      N
                    )
                  )
                }),
              e.jsxs('div', {
                children: [
                  e.jsxs('p', {
                    className:
                      'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5',
                    children: ['SKUs a asignar (', g.length, ')']
                  }),
                  g.length === 0
                    ? e.jsx('p', {
                        className: 'text-xs text-slate-400',
                        children: 'Busca y agrega los SKUs que Calidad debe revisar.'
                      })
                    : e.jsx('div', {
                        className: 'space-y-1.5',
                        children: g.map((x) =>
                          e.jsxs(
                            'div',
                            {
                              className:
                                'flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2',
                              children: [
                                e.jsxs('span', {
                                  className: 'min-w-0',
                                  children: [
                                    e.jsxs('span', {
                                      className: 'font-bold text-sm text-slate-800 truncate block',
                                      children: [x.codigo_producto, ' · ', x.producto]
                                    }),
                                    e.jsxs('span', {
                                      className: 'text-xs text-slate-400',
                                      children: [
                                        x.ubicacion || 's/ubic',
                                        ' · ',
                                        x.partida || 's/partida',
                                        ' · ',
                                        x.cantidad,
                                        ' ',
                                        x.unidad_medida
                                      ]
                                    })
                                  ]
                                }),
                                e.jsx('button', {
                                  onClick: () => $(x._key),
                                  className:
                                    'p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 shrink-0',
                                  children: e.jsx(ie, { size: 15 })
                                })
                              ]
                            },
                            x._key
                          )
                        )
                      })
                ]
              }),
              e.jsxs('div', {
                className: 'grid grid-cols-1 sm:grid-cols-3 gap-3',
                children: [
                  e.jsxs('div', {
                    className: 'sm:col-span-2',
                    children: [
                      e.jsx('label', {
                        className:
                          'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                        children: 'Motivo de la revisión'
                      }),
                      e.jsx('input', {
                        value: p,
                        onChange: (x) => A(x.target.value),
                        placeholder: 'Ej. próximo a vencer / daño detectado / reclamo',
                        className:
                          'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400'
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('label', {
                        className:
                          'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                        children: 'Prioridad'
                      }),
                      e.jsxs('select', {
                        value: u,
                        onChange: (x) => M(x.target.value),
                        className:
                          'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400',
                        children: [
                          e.jsx('option', { value: 'NORMAL', children: 'Normal' }),
                          e.jsx('option', { value: 'URGENTE', children: 'Urgente' })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          e.jsxs('div', {
            className: 'p-4 border-t border-slate-100 flex justify-end gap-2',
            children: [
              e.jsx('button', {
                onClick: s,
                className:
                  'px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50',
                children: 'Cancelar'
              }),
              e.jsxs('button', {
                onClick: T,
                disabled: i.isPending || g.length === 0,
                className:
                  'px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-40',
                children: [
                  i.isPending
                    ? e.jsx(ne, { size: 16, className: 'animate-spin' })
                    : e.jsx(ss, { size: 16 }),
                  ' ',
                  'Asignar a Calidad'
                ]
              })
            ]
          })
        ]
      })
    });
  },
  Et = ({ canAssign: s, canManageQuality: i, onGenerarInforme: d }) => {
    const { user: c } = ve(),
      C = (c == null ? void 0 : c.rol) === 'ADMIN' || (c == null ? void 0 : c.es_admin_delegado),
      { data: b = [], isLoading: t } = Ra(),
      m = Ia(),
      g = za(),
      [E, p] = _.useState(!1),
      A = async (w) => {
        if (confirm('¿Anular esta asignación? No se podrá revertir.'))
          try {
            (await m.mutateAsync(w.id), R.success('Asignación anulada'));
          } catch (l) {
            R.error(`No se pudo anular: ${l.message}`);
          }
      },
      u = async (w) => {
        if (confirm('¿Eliminar esta asignación definitivamente? Esta acción no se puede deshacer.'))
          try {
            (await g.mutateAsync(w.id), R.success('Asignación eliminada'));
          } catch (l) {
            R.error(`No se pudo eliminar: ${l.message}`);
          }
      },
      M = b.filter((w) => w.estado === 'PENDIENTE' || w.estado === 'EN_PROCESO').length;
    return e.jsxs('div', {
      className: 'mb-6',
      children: [
        e.jsxs('div', {
          className: 'flex items-center justify-between gap-3 mb-3',
          children: [
            e.jsxs('h3', {
              className: 'text-sm font-black text-slate-700 flex items-center gap-2',
              children: [
                e.jsx(ns, { size: 16, className: 'text-emerald-500' }),
                ' Revisiones asignadas por Inventario',
                M > 0 &&
                  e.jsxs('span', {
                    className:
                      'text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700',
                    children: [M, ' pendiente(s)']
                  })
              ]
            }),
            s &&
              e.jsxs('button', {
                onClick: () => p(!0),
                className:
                  'px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 hover:bg-slate-800',
                children: [e.jsx(ss, { size: 16 }), ' Asignar SKUs a Calidad']
              })
          ]
        }),
        t
          ? e.jsx('div', {
              className: 'flex justify-center py-8',
              children: e.jsx(ne, { className: 'animate-spin text-emerald-500', size: 26 })
            })
          : b.length === 0
            ? e.jsxs('div', {
                className:
                  'bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center',
                children: [
                  e.jsx(xa, { size: 30, className: 'text-slate-200 mx-auto mb-2' }),
                  e.jsx('p', {
                    className: 'text-sm font-bold text-slate-400',
                    children: 'Sin revisiones asignadas'
                  }),
                  e.jsx('p', {
                    className: 'text-xs text-slate-300',
                    children: s
                      ? 'Usa “Asignar SKUs a Calidad” para enviar productos a revisión.'
                      : 'Inventario aún no ha asignado revisiones.'
                  })
                ]
              })
            : e.jsx('div', {
                className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3',
                children: b.map((w) => {
                  const l = Da[w.estado] || {},
                    S = Array.isArray(w.skus) ? w.skus : [],
                    $ = w.estado === 'PENDIENTE' || w.estado === 'EN_PROCESO';
                  return e.jsxs(
                    'div',
                    {
                      className: `bg-white rounded-2xl border p-4 ${$ ? 'border-amber-200' : 'border-slate-200'}`,
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center justify-between gap-2 mb-2',
                          children: [
                            e.jsx('span', {
                              className: `text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${l.cls}`,
                              children: l.label || w.estado
                            }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-1.5',
                              children: [
                                w.prioridad === 'URGENTE' &&
                                  w.estado !== 'RESUELTA' &&
                                  e.jsxs('span', {
                                    className:
                                      'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-rose-100 text-rose-700 border-rose-200 flex items-center gap-1',
                                    children: [e.jsx(xe, { size: 11 }), ' Urgente']
                                  }),
                                C &&
                                  e.jsx('button', {
                                    onClick: () => u(w),
                                    title: 'Eliminar (admin)',
                                    className:
                                      'p-1.5 rounded-lg text-slate-300 hover:bg-rose-100 hover:text-rose-600',
                                    children: e.jsx(ie, { size: 14 })
                                  })
                              ]
                            })
                          ]
                        }),
                        e.jsxs('p', {
                          className: 'text-sm font-black text-slate-800',
                          children: [S.length, ' SKU(s)']
                        }),
                        e.jsxs('p', {
                          className: 'text-xs text-slate-500 line-clamp-2 mt-0.5',
                          children: [
                            S.slice(0, 3)
                              .map((T) => T.codigo_producto)
                              .join(', '),
                            S.length > 3 ? '…' : ''
                          ]
                        }),
                        w.motivo &&
                          e.jsxs('p', {
                            className: 'text-xs text-slate-400 mt-1 italic',
                            children: ['“', w.motivo, '”']
                          }),
                        e.jsxs('p', {
                          className: 'text-[11px] text-slate-400 mt-2',
                          children: [
                            w.asignado_nombre ? `Por ${w.asignado_nombre}` : 'Inventario',
                            ' ·',
                            ' ',
                            w.created_at ? new Date(w.created_at).toLocaleDateString('es-CL') : ''
                          ]
                        }),
                        $ &&
                          e.jsxs('div', {
                            className: 'flex flex-wrap gap-2 mt-3',
                            children: [
                              i &&
                                e.jsxs('button', {
                                  onClick: () => d(w),
                                  className:
                                    'flex-1 px-3 py-2 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700',
                                  children: [
                                    e.jsx(Oe, { size: 14 }),
                                    ' Generar informe / dictamen ',
                                    e.jsx(ma, { size: 14 })
                                  ]
                                }),
                              s &&
                                e.jsx('button', {
                                  onClick: () => A(w),
                                  title: 'Anular',
                                  className:
                                    'px-3 py-2 rounded-xl border border-slate-200 text-slate-500 font-black text-xs flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200',
                                  children: e.jsx(Fs, { size: 14 })
                                })
                            ]
                          }),
                        w.estado === 'RESUELTA' &&
                          e.jsxs('p', {
                            className:
                              'text-[11px] text-emerald-600 font-bold mt-3 flex items-center gap-1',
                            children: [
                              e.jsx(Oe, { size: 12 }),
                              ' Resuelta',
                              w.resuelto_nombre ? ` por ${w.resuelto_nombre}` : ''
                            ]
                          })
                      ]
                    },
                    w.id
                  );
                })
              }),
        E && e.jsx(Ct, { onClose: () => p(!1) })
      ]
    });
  },
  kt = ({ onClose: s, onCreated: i }) => {
    const d = Pa(),
      [c, C] = _.useState(''),
      [b, t] = _.useState(''),
      [m, g] = _.useState(''),
      [E, p] = _.useState(''),
      [A, u] = _.useState(''),
      [M, w] = _.useState(''),
      [l, S] = _.useState(!1),
      [$, T] = _.useState([]),
      [x, N] = _.useState([]),
      [a, o] = _.useState(null),
      [f, n] = _.useState(!1),
      v = _.useCallback(async () => {
        if (!c.trim()) {
          R.error('Escribe primero el número de N.V.');
          return;
        }
        n(!0);
        try {
          const O = await ct(c);
          if (!O) {
            (o(null), R.info(`La N.V ${c.trim()} no está en el Panel PTM (puedes seguir a mano).`));
            return;
          }
          (o(O),
            O.cliente && t(O.cliente),
            O.guia && g(O.guia),
            O.transportista && p(O.transportista),
            O.bultos && u(O.bultos),
            R.success(`N.V ${O.nv} encontrada en el Panel: datos cargados`));
        } catch (O) {
          R.error(`No se pudo consultar el Panel PTM: ${O.message}`);
        } finally {
          n(!1);
        }
      }, [c]),
      h = (O) => {
        const J = new Map();
        return (
          (O || []).forEach((X) => {
            const ee = `${X.codigo_producto}|${X.partida || ''}`,
              D = J.get(ee);
            D
              ? (D.disponible = Number(D.disponible || 0) + (Number(X.disponible) || 0))
              : J.set(ee, { ...X, ubicacion: '', disponible: Number(X.disponible) || 0 });
          }),
          [...J.values()]
        );
      },
      L = _.useCallback(async () => {
        S(!0);
        try {
          T(h(await bs(M, !1)));
        } catch (O) {
          R.error(`Error buscando stock: ${O.message}`);
        } finally {
          S(!1);
        }
      }, [M]),
      q = (O) => `${O.codigo_producto}|${O.partida || ''}`,
      Q = (O) => {
        const J = q(O);
        if (x.some((X) => X._key === J)) {
          R.info('Ese SKU ya está agregado');
          return;
        }
        N((X) => [
          ...X,
          {
            _key: J,
            codigo_producto: O.codigo_producto,
            producto: O.producto || '',
            ubicacion: '',
            partida: O.partida || '',
            cantidad: Number(O.disponible) || 0,
            unidad_medida: O.unidad_medida || 'UN'
          }
        ]);
      },
      F = (O) => N((J) => J.filter((X) => X._key !== O)),
      Z = async () => {
        if (!c.trim()) {
          R.error('Escribe la N.V.');
          return;
        }
        if (x.length === 0) {
          R.error('Agrega al menos un SKU');
          return;
        }
        try {
          const O = x.map(({ _key: X, ...ee }) => ee),
            J = await d.mutateAsync({
              nv: c.trim(),
              skus: O,
              cliente: b.trim() || null,
              guia: m.trim() || null,
              transportista: E.trim() || null,
              bultos: A ? Number(A) : null
            });
          (R.success('Certificación de salida creada'), i(J == null ? void 0 : J.id));
        } catch (O) {
          R.error(`No se pudo crear: ${O.message}`);
        }
      };
    return e.jsx('div', {
      className: 'fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-3',
      onClick: s,
      children: e.jsxs('div', {
        className:
          'bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col',
        onClick: (O) => O.stopPropagation(),
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between p-5 border-b border-slate-100',
            children: [
              e.jsxs('h3', {
                className: 'font-black text-slate-900 flex items-center gap-2',
                children: [
                  e.jsx(Ps, { size: 18, className: 'text-emerald-600' }),
                  ' Certificar salida (manual)'
                ]
              }),
              e.jsx('button', {
                onClick: s,
                className: 'p-2 rounded-lg hover:bg-slate-100 text-slate-400',
                children: e.jsx(Re, { size: 18 })
              })
            ]
          }),
          e.jsxs('div', {
            className: 'p-5 overflow-y-auto space-y-4',
            children: [
              e.jsxs('div', {
                className: 'grid grid-cols-3 gap-3',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx('label', {
                        className:
                          'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                        children: 'N.V. *'
                      }),
                      e.jsxs('div', {
                        className: 'flex gap-1.5 mt-1',
                        children: [
                          e.jsx('input', {
                            value: c,
                            onChange: (O) => C(O.target.value),
                            onKeyDown: (O) => O.key === 'Enter' && v(),
                            placeholder: 'Ej. 95811',
                            className:
                              'w-full px-3 py-2 rounded-xl border border-emerald-300 text-sm font-bold outline-none focus:border-emerald-500'
                          }),
                          e.jsx('button', {
                            onClick: v,
                            disabled: f || !c.trim(),
                            title: 'Traer datos de la N.V desde el Panel PTM',
                            className:
                              'px-3 py-2 rounded-xl bg-indigo-600 text-white shrink-0 hover:bg-indigo-700 disabled:opacity-40',
                            children: f
                              ? e.jsx(ne, { size: 15, className: 'animate-spin' })
                              : e.jsx(ce, { size: 15 })
                          })
                        ]
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('label', {
                        className:
                          'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                        children: 'Guía'
                      }),
                      e.jsx('input', {
                        value: m,
                        onChange: (O) => g(O.target.value),
                        placeholder: 'Opcional',
                        className:
                          'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400'
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('label', {
                        className:
                          'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                        children: 'Bultos'
                      }),
                      e.jsx('input', {
                        value: A,
                        onChange: (O) => u(O.target.value.replace(/[^0-9]/g, '')),
                        placeholder: '0',
                        inputMode: 'numeric',
                        className:
                          'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400'
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    className: 'col-span-3',
                    children: [
                      e.jsx('label', {
                        className:
                          'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                        children: 'Cliente'
                      }),
                      e.jsx('input', {
                        value: b,
                        onChange: (O) => t(O.target.value),
                        placeholder: 'Opcional',
                        title: b,
                        className:
                          'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400'
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    className: 'col-span-3',
                    children: [
                      e.jsx('label', {
                        className:
                          'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                        children: 'Transportista'
                      }),
                      e.jsx('input', {
                        value: E,
                        onChange: (O) => p(O.target.value),
                        placeholder: 'Opcional',
                        className:
                          'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400'
                      })
                    ]
                  })
                ]
              }),
              a &&
                e.jsxs('div', {
                  className:
                    'rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 text-xs space-y-1.5',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center justify-between gap-2 flex-wrap',
                      children: [
                        e.jsxs('span', {
                          className:
                            'font-black text-indigo-700 uppercase tracking-widest text-[10px]',
                          children: ['N.V ', a.nv, ' · Panel Dashboard PTM']
                        }),
                        e.jsxs('span', {
                          className: 'flex items-center gap-1.5',
                          children: [
                            a.urgente &&
                              e.jsx('span', {
                                className:
                                  'px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black',
                                children: 'URGENTE'
                              }),
                            a.estado &&
                              e.jsx('span', {
                                className:
                                  'px-1.5 py-0.5 rounded-md bg-white text-indigo-700 border border-indigo-200 text-[10px] font-black',
                                children: a.estado
                              })
                          ]
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      className: 'grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-slate-600',
                      children: [
                        a.vendedor &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'Vendedor:' }),
                              ' ',
                              a.vendedor
                            ]
                          }),
                        a.factura &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'Factura:' }),
                              ' ',
                              a.factura
                            ]
                          }),
                        a.numeroEnvio &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'N° envío:' }),
                              ' ',
                              a.numeroEnvio
                            ]
                          }),
                        a.tipoDespacho &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', {
                                className: 'text-slate-400',
                                children: 'Tipo despacho:'
                              }),
                              ' ',
                              a.tipoDespacho
                            ]
                          }),
                        a.fechaCompromiso &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'Compromiso:' }),
                              ' ',
                              a.fechaCompromiso.split('-').reverse().join('-')
                            ]
                          }),
                        a.fechaDespacho &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'Despacho:' }),
                              ' ',
                              a.fechaDespacho.split('-').reverse().join('-')
                            ]
                          }),
                        a.division &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'División:' }),
                              ' ',
                              a.division
                            ]
                          }),
                        a.centroCosto &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', {
                                className: 'text-slate-400',
                                children: 'Centro costo:'
                              }),
                              ' ',
                              a.centroCosto
                            ]
                          })
                      ]
                    })
                  ]
                }),
              e.jsxs('div', {
                className: 'flex gap-2',
                children: [
                  e.jsxs('div', {
                    className:
                      'flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 focus-within:border-emerald-400',
                    children: [
                      e.jsx(ce, { size: 16, className: 'text-slate-400' }),
                      e.jsx('input', {
                        value: M,
                        onChange: (O) => w(O.target.value),
                        onKeyDown: (O) => O.key === 'Enter' && L(),
                        placeholder: 'Buscar SKU por código, descripción o ubicación…',
                        className: 'flex-1 text-sm outline-none bg-transparent'
                      })
                    ]
                  }),
                  e.jsxs('button', {
                    onClick: L,
                    disabled: l,
                    className:
                      'px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 disabled:opacity-50',
                    children: [
                      l
                        ? e.jsx(ne, { size: 16, className: 'animate-spin' })
                        : e.jsx(ce, { size: 16 }),
                      ' ',
                      'Buscar'
                    ]
                  })
                ]
              }),
              $.length > 0 &&
                e.jsx('div', {
                  className:
                    'border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-44 overflow-y-auto',
                  children: $.map((O, J) =>
                    e.jsxs(
                      'button',
                      {
                        onClick: () => Q(O),
                        className:
                          'w-full text-left px-3 py-2 hover:bg-emerald-50/50 flex items-center justify-between gap-2',
                        children: [
                          e.jsxs('span', {
                            className: 'min-w-0',
                            children: [
                              e.jsxs('span', {
                                className: 'font-bold text-sm text-slate-800 truncate block',
                                children: [O.codigo_producto, ' · ', O.producto]
                              }),
                              e.jsxs('span', {
                                className: 'text-xs text-slate-400',
                                children: [
                                  O.partida || 's/partida',
                                  ' · ',
                                  O.disponible,
                                  ' ',
                                  O.unidad_medida,
                                  ' disponibles'
                                ]
                              })
                            ]
                          }),
                          e.jsx(fe, { size: 16, className: 'text-emerald-500 shrink-0' })
                        ]
                      },
                      J
                    )
                  )
                }),
              e.jsxs('div', {
                children: [
                  e.jsxs('p', {
                    className:
                      'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5',
                    children: ['SKUs del despacho (', x.length, ')']
                  }),
                  x.length === 0
                    ? e.jsx('p', {
                        className: 'text-xs text-slate-400',
                        children: 'Agrega los SKUs que se están despachando en esta N.V.'
                      })
                    : e.jsx('div', {
                        className: 'space-y-1.5',
                        children: x.map((O) =>
                          e.jsxs(
                            'div',
                            {
                              className:
                                'flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2',
                              children: [
                                e.jsxs('span', {
                                  className: 'min-w-0',
                                  children: [
                                    e.jsxs('span', {
                                      className: 'font-bold text-sm text-slate-800 truncate block',
                                      children: [O.codigo_producto, ' · ', O.producto]
                                    }),
                                    e.jsxs('span', {
                                      className: 'text-xs text-slate-400',
                                      children: [
                                        O.partida || 's/partida',
                                        ' · ',
                                        O.cantidad,
                                        ' ',
                                        O.unidad_medida
                                      ]
                                    })
                                  ]
                                }),
                                e.jsx('button', {
                                  onClick: () => F(O._key),
                                  className:
                                    'p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 shrink-0',
                                  children: e.jsx(ie, { size: 15 })
                                })
                              ]
                            },
                            O._key
                          )
                        )
                      })
                ]
              })
            ]
          }),
          e.jsxs('div', {
            className: 'p-4 border-t border-slate-100 flex justify-end gap-2',
            children: [
              e.jsx('button', {
                onClick: s,
                className:
                  'px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50',
                children: 'Cancelar'
              }),
              e.jsxs('button', {
                onClick: Z,
                disabled: d.isPending || !c.trim() || x.length === 0,
                className:
                  'px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-40',
                children: [
                  d.isPending
                    ? e.jsx(ne, { size: 16, className: 'animate-spin' })
                    : e.jsx(We, { size: 16 }),
                  ' ',
                  'Crear certificación'
                ]
              })
            ]
          })
        ]
      })
    });
  },
  At = ({ tarea: s, onBack: i, canManage: d }) => {
    const c = Hs(),
      C = Ks(),
      b = s.estado === 'CONFORME' || s.estado === 'NO_CONFORME',
      t = b || !d,
      m = s.contexto || {},
      g = (k) => {
        const { _extras: z, ...V } = k || {};
        return { resp: V, extras: z || {} };
      },
      [E, p] = _.useState(() => g(s.checklist).resp),
      [A, u] = _.useState(() => g(s.checklist).extras),
      [M, w] = _.useState(s.observaciones || ''),
      [l, S] = _.useState(s.disposicion || '');
    _.useEffect(() => {
      const { resp: k, extras: z } = g(s.checklist);
      (p(k), u(z), w(s.observaciones || ''), S(s.disposicion || ''));
    }, [s.id]);
    const $ = (k, z) => p((V) => ({ ...V, [k]: { ...V[k], estado: z } })),
      T = (k, z) => p((V) => ({ ...V, [k]: { ...V[k], nota: z } })),
      x = (k, z) => p((V) => ({ ...V, [k]: { ...V[k], evidencia: z } })),
      N = (k, z) => u((V) => ({ ...V, [k]: z })),
      {
        answeredAll: a,
        hasNo: o,
        faltan: f
      } = _.useMemo(() => {
        var V;
        let k = 0,
          z = !1;
        for (const se of Qe) {
          const te = (V = E[se.id]) == null ? void 0 : V.estado;
          (te && k++, te === 'NO' && (z = !0));
        }
        return { answeredAll: k === Qe.length, hasNo: z, faltan: Qe.length - k };
      }, [E]),
      n = async (k) => {
        try {
          const z = { tipo: 'SALIDA' };
          if (k === 'pdf') {
            const V = g(s.checklist).extras.evidencias || A.evidencias || [],
              se = [];
            for (const te of V)
              try {
                const pe = await ls(Te, te.path);
                if (!pe) continue;
                const ue = await fetch(pe).then((he) => (he.ok ? he.blob() : null));
                if (!ue || !/image\/(jpeg|png)/.test(ue.type)) continue;
                const Ce = await new Promise((he, le) => {
                  const j = new FileReader();
                  ((j.onload = () => he(j.result)), (j.onerror = le), j.readAsDataURL(ue));
                });
                se.push({ tipo: te.tipo, dataUrl: Ce });
              } catch {}
            ((z.evidenciasImg = se), await oa(s, Ze, z));
          } else await ta(s, Ze, z);
        } catch (z) {
          R.error(`No se pudo generar el documento: ${z.message}`);
        }
      },
      v = async () => {
        if (
          confirm(
            '¿Firmar digitalmente este certificado de salida? Quedará sellado y verificable por folio/QR.'
          )
        )
          try {
            const k = await C.mutateAsync(s.id);
            R.success(`Documento firmado por ${(k == null ? void 0 : k.firmado_nombre) || ''}`);
          } catch (k) {
            R.error(`No se pudo firmar: ${k.message}`);
          }
      },
      h = (k = A) => ({ ...E, _extras: k }),
      L = async () => {
        try {
          (await c.mutateAsync({
            tareaId: s.id,
            checklist: h(),
            observaciones: M,
            disposicion: l,
            finalizar: !1
          }),
            R.success('Avance guardado'));
        } catch (k) {
          R.error(`No se pudo guardar: ${k.message}`);
        }
      },
      q = async () => {
        if (!a) {
          R.error(`Faltan ${f} ítem(s) por responder`);
          return;
        }
        const k = o ? 'NO_CONFORME' : 'CONFORME';
        if (k === 'NO_CONFORME' && !l) {
          R.error('Selecciona la disposición antes de finalizar');
          return;
        }
        if (
          confirm(
            k === 'CONFORME'
              ? 'Todos los ítems conformes → se emitirá el CERTIFICADO DE CONFORMIDAD DE SALIDA (folio CERT-SAL-) y la tarea quedará bloqueada. ¿Continuar?'
              : `Hay ítems NO conformes → SALIDA NO CONFORME (folio ACTA-SAL-), disposición "${l}". No despachar hasta resolver. ¿Continuar?`
          )
        )
          try {
            const z = await c.mutateAsync({
              tareaId: s.id,
              checklist: h(),
              observaciones: M,
              disposicion: l,
              finalizar: !0,
              resultado: k
            });
            k === 'CONFORME'
              ? (R.success(`Salida certificada ${(z == null ? void 0 : z.folio) || ''}`), i())
              : R.warning('Salida NO CONFORME. No despachar hasta resolver.');
          } catch (z) {
            R.error(`No se pudo finalizar: ${z.message}`);
          }
      },
      Q = _.useRef(null),
      [F, Z] = _.useState(!1),
      O = typeof navigator < 'u' && navigator.maxTouchPoints > 0,
      [J, X] = _.useState(null),
      [ee, D] = _.useState(!1),
      [H, Y] = _.useState({}),
      W = A.evidencias || [];
    _.useEffect(() => {
      let k = !0;
      return (
        is(
          Te,
          W.map((z) => z.path)
        ).then((z) => {
          k && Y(z);
        }),
        () => {
          k = !1;
        }
      );
    }, [JSON.stringify(W.map((k) => k.path))]);
    const y = (k, z = 'galeria') => {
        var V;
        (X(k), z === 'camara' ? Z(!0) : (V = Q.current) == null || V.click());
      },
      U = async (k) => {
        var V;
        const z = Array.from(k.target.files || []);
        if (((k.target.value = ''), !(!z.length || !J))) {
          D(!0);
          try {
            const se = [];
            for (const te of z) {
              if (!te.type.startsWith('image/')) continue;
              const pe = await _s(te),
                ue = await Ma({ tareaId: s.id, tipo: J, blob: pe });
              se.push({ tipo: J, path: ue, subido_en: new Date().toISOString() });
            }
            if (se.length) {
              const te = { ...A, evidencias: [...W, ...se] };
              (u(te),
                await c.mutateAsync({
                  tareaId: s.id,
                  checklist: h(te),
                  observaciones: M,
                  disposicion: l,
                  finalizar: !1
                }),
                R.success(
                  se.length > 1 ? 'Fotos agregadas al certificado' : 'Foto agregada al certificado'
                ));
            }
          } catch (se) {
            R.error(
              (V = se == null ? void 0 : se.message) != null && V.includes('row-level security')
                ? 'No tienes permiso para subir fotos'
                : `Error al subir: ${se.message}`
            );
          } finally {
            (D(!1), X(null));
          }
        }
      },
      r = async (k) => {
        if (confirm('¿Eliminar esta foto del certificado?'))
          try {
            await Js(k.path);
            const z = { ...A, evidencias: W.filter((V) => V.path !== k.path) };
            (u(z),
              await c.mutateAsync({
                tareaId: s.id,
                checklist: h(z),
                observaciones: M,
                disposicion: l,
                finalizar: !1
              }),
              R.success('Foto eliminada'));
          } catch {
            R.error('No se pudo eliminar la foto');
          }
      },
      B = (k) =>
        u((z) => {
          const V = new Set(z.riesgos || []);
          return k === 'NINGUNO'
            ? { ...z, riesgos: V.has('NINGUNO') ? [] : ['NINGUNO'] }
            : (V.delete('NINGUNO'), V.has(k) ? V.delete(k) : V.add(k), { ...z, riesgos: [...V] });
        }),
      G = Number(A.bultosTotal ?? s.bultos) || 0,
      P = Array.isArray(A.bultosEtiquetas) ? A.bultosEtiquetas : [],
      re = (k) => {
        const z = Array.from({ length: G }, (V, se) => !!P[se]);
        ((z[k] = !z[k]), N('bultosEtiquetas', z));
      },
      me = A.pesos || {},
      de = ps(me.esperado, me.registrado),
      ke = b
        ? ye(s)
        : a
          ? o
            ? l === 'Despachar con salvedades (autorizado)'
              ? { ...Ue.NARANJA }
              : { ...Ue.ROJO }
            : { ...Ue.VERDE }
          : { ...Ue.PENDIENTE },
      _e = ({ pid: k, val: z, icon: V, activeCls: se }) => {
        var pe;
        const te = ((pe = E[k]) == null ? void 0 : pe.estado) === z;
        return e.jsx('button', {
          type: 'button',
          disabled: t,
          onClick: () => $(k, z),
          className: `w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shrink-0
          ${te ? se : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'} ${t ? 'opacity-60 cursor-default' : ''}`,
          children: V
        });
      },
      Ie = Se[s.estado] || {};
    return e.jsxs('div', {
      children: [
        e.jsxs('button', {
          onClick: i,
          className:
            'flex items-center gap-2 text-slate-500 font-bold text-sm mb-4 hover:text-slate-800',
          children: [e.jsx(Le, { size: 18 }), ' Volver a la cola']
        }),
        e.jsxs('div', {
          className:
            'bg-white rounded-2xl border border-slate-200 p-5 mb-4 flex flex-wrap items-center justify-between gap-3',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsx('div', {
                  className:
                    'w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600',
                  children: e.jsx(Je, { size: 26 })
                }),
                e.jsxs('div', {
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-2 flex-wrap',
                      children: [
                        e.jsx('span', {
                          className: 'font-black text-slate-900',
                          children: s.proveedor || m.cliente || 'Sin cliente'
                        }),
                        e.jsx('span', {
                          className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${Ie.cls || ''}`,
                          children: Ie.label || s.estado
                        })
                      ]
                    }),
                    e.jsxs('p', {
                      className:
                        'text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-3 flex-wrap',
                      children: [
                        e.jsxs('span', { children: ['NV ', s.oc || m.nv || '—'] }),
                        e.jsxs('span', { children: ['Guía ', m.guia || '—'] }),
                        m.factura && e.jsxs('span', { children: ['Factura ', m.factura] }),
                        e.jsxs('span', {
                          className: 'flex items-center gap-1',
                          children: [e.jsx($s, { size: 12 }), ' ', s.fecha_recepcion || '—']
                        }),
                        s.bultos != null &&
                          e.jsxs('span', { children: ['· ', s.bultos, ' bultos'] })
                      ]
                    })
                  ]
                })
              ]
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                s.folio &&
                  e.jsxs('div', {
                    className: 'text-right',
                    children: [
                      e.jsx('p', {
                        className:
                          'text-[10px] font-black text-emerald-500 uppercase tracking-widest',
                        children: 'Certificado'
                      }),
                      e.jsx('p', {
                        className: 'font-mono font-black text-emerald-700',
                        children: s.folio
                      })
                    ]
                  }),
                e.jsxs('div', {
                  className: 'flex gap-2',
                  children: [
                    e.jsxs('button', {
                      onClick: () => n('pdf'),
                      className:
                        'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                      children: [e.jsx(Ts, { size: 15 }), ' PDF']
                    }),
                    e.jsxs('button', {
                      onClick: () => n('word'),
                      className:
                        'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                      children: [e.jsx(Oe, { size: 15 }), ' Word']
                    })
                  ]
                })
              ]
            })
          ]
        }),
        e.jsxs('div', {
          className: `rounded-2xl border-2 p-4 mb-4 flex items-center justify-between gap-3 flex-wrap ${ke.cls}`,
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsx('span', { className: 'text-3xl leading-none', children: ke.emoji }),
                e.jsxs('div', {
                  children: [
                    e.jsx('p', {
                      className: 'font-black text-lg tracking-tight',
                      children: ke.label
                    }),
                    e.jsx('p', {
                      className: 'text-xs opacity-80 font-bold',
                      children: b
                        ? s.disposicion
                          ? `Disposición: ${s.disposicion}`
                          : `Folio ${s.folio || '—'}`
                        : f > 0
                          ? `${f} ítem(s) del checklist por responder`
                          : 'Checklist completo — listo para finalizar'
                    })
                  ]
                })
              ]
            }),
            de &&
              e.jsxs('span', {
                className: `text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${de === 'CONFORME' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`,
                children: ['Peso ', de]
              })
          ]
        }),
        Array.isArray(m.skus) &&
          m.skus.length > 0 &&
          e.jsxs('div', {
            className: 'bg-white rounded-2xl border border-slate-200 p-5 mb-4',
            children: [
              e.jsxs('h3', {
                className: 'text-sm font-black text-slate-800 mb-3 flex items-center gap-2',
                children: [
                  e.jsx($e, { size: 16, className: 'text-slate-400' }),
                  ' SKUs del despacho (',
                  m.skus.length,
                  ')'
                ]
              }),
              e.jsx('div', {
                className: 'space-y-1.5',
                children: m.skus.map((k, z) =>
                  e.jsxs(
                    'div',
                    {
                      className:
                        'flex items-center justify-between gap-2 text-sm border-b border-slate-50 last:border-0 py-1.5',
                      children: [
                        e.jsxs('span', {
                          className: 'min-w-0',
                          children: [
                            e.jsx('b', {
                              className: 'text-slate-800',
                              children: k.codigo_producto
                            }),
                            ' ',
                            e.jsxs('span', {
                              className: 'text-slate-500',
                              children: ['· ', k.producto]
                            })
                          ]
                        }),
                        e.jsxs('span', {
                          className: 'text-xs text-slate-400 shrink-0',
                          children: [
                            k.ubicacion || '—',
                            ' · ',
                            k.cantidad,
                            ' ',
                            k.unidad_medida || ''
                          ]
                        })
                      ]
                    },
                    z
                  )
                )
              })
            ]
          }),
        s.firma_digital
          ? e.jsxs('div', {
              className:
                'bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex items-start gap-3',
              children: [
                e.jsx(Ls, { size: 22, className: 'text-emerald-600 shrink-0 mt-0.5' }),
                e.jsxs('div', {
                  className: 'text-sm min-w-0',
                  children: [
                    e.jsx('p', {
                      className: 'font-black text-emerald-800',
                      children: 'Firmado digitalmente'
                    }),
                    e.jsxs('p', {
                      className: 'text-emerald-700 text-xs',
                      children: [
                        s.firmado_nombre || '—',
                        ' ·',
                        ' ',
                        s.firmado_en ? new Date(s.firmado_en).toLocaleString('es-CL') : '',
                        ' ·',
                        ' ',
                        s.firma_algoritmo
                      ]
                    })
                  ]
                })
              ]
            })
          : b && d
            ? e.jsxs('div', {
                className:
                  'bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3',
                children: [
                  e.jsxs('div', {
                    className: 'text-sm text-slate-600 flex items-center gap-2',
                    children: [
                      e.jsx(Ve, { size: 18, className: 'text-slate-400' }),
                      ' Documento sin firmar.'
                    ]
                  }),
                  e.jsxs('button', {
                    onClick: v,
                    disabled: C.isPending,
                    className:
                      'px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50',
                    children: [e.jsx(Ve, { size: 16 }), ' Firmar digitalmente']
                  })
                ]
              })
            : null,
        e.jsxs('div', {
          className: 'space-y-4',
          children: [
            Ze.map((k) =>
              e.jsxs(
                'div',
                {
                  className: 'bg-white rounded-2xl border border-slate-200 p-5',
                  children: [
                    e.jsx('h3', {
                      className: 'text-sm font-black text-slate-800 mb-3',
                      children: k.titulo
                    }),
                    e.jsx('div', {
                      className: 'space-y-2.5',
                      children: k.params.map((z) => {
                        var V, se, te, pe, ue, Ce, he;
                        return e.jsxs(
                          'div',
                          {
                            className:
                              'flex items-start gap-3 py-1.5 border-b border-slate-50 last:border-0',
                            children: [
                              e.jsxs('div', {
                                className: 'flex-1 min-w-0',
                                children: [
                                  e.jsx('p', {
                                    className: 'text-sm text-slate-700 font-semibold',
                                    children: z.label
                                  }),
                                  ((V = E[z.id]) == null ? void 0 : V.estado) &&
                                    e.jsxs('div', {
                                      className: 'mt-1.5 flex items-center gap-1.5',
                                      children: [
                                        e.jsx('span', {
                                          className:
                                            'text-[10px] font-black text-slate-400 uppercase',
                                          children: 'Evidencia:'
                                        }),
                                        e.jsxs('select', {
                                          value:
                                            ((se = E[z.id]) == null ? void 0 : se.evidencia) || '',
                                          disabled: t,
                                          onChange: (le) => x(z.id, le.target.value),
                                          className: `px-2 py-1 rounded-lg border text-[11px] font-bold ${(te = E[z.id]) != null && te.evidencia ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 text-slate-400'}`,
                                          children: [
                                            e.jsx('option', {
                                              value: '',
                                              children: '— cómo se verificó —'
                                            }),
                                            qs.map((le) =>
                                              e.jsx('option', { value: le, children: le }, le)
                                            )
                                          ]
                                        })
                                      ]
                                    }),
                                  ((pe = E[z.id]) == null ? void 0 : pe.estado) === 'NO' &&
                                    e.jsx('input', {
                                      value: ((ue = E[z.id]) == null ? void 0 : ue.nota) || '',
                                      disabled: t,
                                      onChange: (le) => T(z.id, le.target.value),
                                      placeholder: 'Detalle de la no conformidad…',
                                      className:
                                        'mt-1.5 w-full px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/40 text-xs outline-none focus:border-rose-400'
                                    }),
                                  ((Ce = E[z.id]) == null ? void 0 : Ce.estado) === 'NA' &&
                                    e.jsx('input', {
                                      value: ((he = E[z.id]) == null ? void 0 : he.nota) || '',
                                      disabled: t,
                                      onChange: (le) => T(z.id, le.target.value),
                                      placeholder:
                                        'Justificación del N/A (recomendada para auditoría)…',
                                      className:
                                        'mt-1.5 w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs outline-none focus:border-slate-400'
                                    })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'flex items-center gap-1.5',
                                children: [
                                  e.jsx(_e, {
                                    pid: z.id,
                                    val: 'OK',
                                    icon: e.jsx(ze, { size: 16 }),
                                    activeCls: 'bg-emerald-500 border-emerald-500 text-white'
                                  }),
                                  e.jsx(_e, {
                                    pid: z.id,
                                    val: 'NO',
                                    icon: e.jsx(Re, { size: 16 }),
                                    activeCls: 'bg-rose-500 border-rose-500 text-white'
                                  }),
                                  e.jsx(_e, {
                                    pid: z.id,
                                    val: 'NA',
                                    icon: e.jsx(es, { size: 16 }),
                                    activeCls: 'bg-slate-400 border-slate-400 text-white'
                                  })
                                ]
                              })
                            ]
                          },
                          z.id
                        );
                      })
                    })
                  ]
                },
                k.nivel
              )
            ),
            e.jsxs('div', {
              className: 'bg-white rounded-2xl border border-slate-200 p-5',
              children: [
                e.jsxs('h3', {
                  className: 'text-sm font-black text-slate-800 mb-3 flex items-center gap-2',
                  children: [
                    e.jsx(pa, { size: 16, className: 'text-slate-400' }),
                    ' Control de peso'
                  ]
                }),
                e.jsxs('div', {
                  className: 'grid grid-cols-2 sm:grid-cols-3 gap-3 items-end',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className:
                            'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                          children: 'Peso esperado (kg)'
                        }),
                        e.jsx('input', {
                          value: me.esperado || '',
                          disabled: t,
                          inputMode: 'decimal',
                          onChange: (k) =>
                            N('pesos', {
                              ...me,
                              esperado: k.target.value.replace(/[^0-9.,]/g, '')
                            }),
                          placeholder: 'Ej. 125',
                          className:
                            'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400'
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('label', {
                          className:
                            'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                          children: 'Peso registrado (kg)'
                        }),
                        e.jsx('input', {
                          value: me.registrado || '',
                          disabled: t,
                          inputMode: 'decimal',
                          onChange: (k) =>
                            N('pesos', {
                              ...me,
                              registrado: k.target.value.replace(/[^0-9.,]/g, '')
                            }),
                          placeholder: 'Ej. 125,3',
                          className:
                            'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400'
                        })
                      ]
                    }),
                    e.jsx('div', {
                      className: 'col-span-2 sm:col-span-1',
                      children: de
                        ? e.jsxs('span', {
                            className: `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-black ${de === 'CONFORME' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`,
                            children: [
                              de === 'CONFORME' ? e.jsx(ze, { size: 15 }) : e.jsx(xe, { size: 15 }),
                              ' ',
                              de
                            ]
                          })
                        : e.jsx('span', {
                            className: 'text-xs text-slate-400 font-bold',
                            children:
                              'Ingresa ambos pesos (tolerancia ±2%). Si falta una caja, el peso cambia.'
                          })
                    })
                  ]
                })
              ]
            }),
            e.jsxs('div', {
              className: 'bg-white rounded-2xl border border-slate-200 p-5',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center justify-between gap-3 flex-wrap mb-3',
                  children: [
                    e.jsxs('h3', {
                      className: 'text-sm font-black text-slate-800 flex items-center gap-2',
                      children: [
                        e.jsx(Ms, { size: 16, className: 'text-slate-400' }),
                        ' Bultos y etiquetas'
                      ]
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx('label', {
                          className:
                            'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                          children: 'Total bultos'
                        }),
                        e.jsx('input', {
                          value: A.bultosTotal ?? s.bultos ?? '',
                          disabled: t,
                          inputMode: 'numeric',
                          onChange: (k) => N('bultosTotal', k.target.value.replace(/[^0-9]/g, '')),
                          className:
                            'w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-black text-center outline-none focus:border-emerald-400'
                        })
                      ]
                    })
                  ]
                }),
                G > 0
                  ? e.jsxs(e.Fragment, {
                      children: [
                        e.jsx('div', {
                          className: 'flex flex-wrap gap-2',
                          children: Array.from({ length: Math.min(G, 60) }, (k, z) =>
                            e.jsxs(
                              'button',
                              {
                                type: 'button',
                                disabled: t,
                                onClick: () => re(z),
                                className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${P[z] ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'}`,
                                children: [
                                  'Bulto ',
                                  z + 1,
                                  '/',
                                  G,
                                  ' · ',
                                  P[z] ? 'Etiqueta OK' : 'Pendiente'
                                ]
                              },
                              z
                            )
                          )
                        }),
                        e.jsxs('p', {
                          className: 'text-xs font-bold mt-2 text-slate-500',
                          children: [
                            P.slice(0, G).filter(Boolean).length,
                            '/',
                            G,
                            ' etiquetas verificadas'
                          ]
                        })
                      ]
                    })
                  : e.jsx('p', {
                      className: 'text-xs text-slate-400',
                      children: 'Define el total de bultos para verificar la etiqueta de cada uno.'
                    })
              ]
            }),
            e.jsxs('div', {
              className: 'bg-white rounded-2xl border border-slate-200 p-5',
              children: [
                e.jsxs('h3', {
                  className: 'text-sm font-black text-slate-800 mb-3 flex items-center gap-2',
                  children: [
                    e.jsx(xe, { size: 16, className: 'text-slate-400' }),
                    ' Riesgos evaluados'
                  ]
                }),
                e.jsx('div', {
                  className: 'flex flex-wrap gap-2',
                  children: us.map((k) => {
                    const z = (A.riesgos || []).includes(k.id);
                    return e.jsxs(
                      'button',
                      {
                        type: 'button',
                        disabled: t,
                        onClick: () => B(k.id),
                        className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${z ? (k.id === 'NINGUNO' ? 'bg-slate-700 border-slate-700 text-white' : 'bg-amber-500 border-amber-500 text-white') : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'}`,
                        children: [z ? '☑' : '☐', ' ', k.label]
                      },
                      k.id
                    );
                  })
                })
              ]
            }),
            e.jsxs('div', {
              className: 'bg-white rounded-2xl border border-slate-200 p-5',
              children: [
                e.jsxs('h3', {
                  className: 'text-sm font-black text-slate-800 mb-3 flex items-center gap-2',
                  children: [
                    e.jsx(De, { size: 16, className: 'text-slate-400' }),
                    ' Evidencia fotográfica'
                  ]
                }),
                e.jsx('div', {
                  className: 'grid sm:grid-cols-3 gap-3',
                  children: La.map((k) => {
                    const z = W.filter((V) => V.tipo === k.id);
                    return e.jsxs(
                      'div',
                      {
                        className: 'rounded-xl border border-slate-100 p-3',
                        children: [
                          e.jsxs('p', {
                            className:
                              'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2',
                            children: ['📷 ', k.label, ' (', z.length, ')']
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2 flex-wrap',
                            children: [
                              z.map((V) =>
                                e.jsxs(
                                  'div',
                                  {
                                    className:
                                      'relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0',
                                    children: [
                                      e.jsx('a', {
                                        href: H[V.path] || '#',
                                        target: '_blank',
                                        rel: 'noreferrer',
                                        children: e.jsx('img', {
                                          src: H[V.path] || '',
                                          alt: k.label,
                                          className: 'w-full h-full object-cover'
                                        })
                                      }),
                                      !t &&
                                        e.jsx('button', {
                                          onClick: () => r(V),
                                          title: 'Eliminar foto',
                                          className:
                                            'absolute top-0.5 right-0.5 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity',
                                          children: e.jsx(ie, { size: 11 })
                                        })
                                    ]
                                  },
                                  V.path
                                )
                              ),
                              !t &&
                                O &&
                                e.jsxs('button', {
                                  type: 'button',
                                  onClick: () => y(k.id, 'camara'),
                                  disabled: ee,
                                  title: 'Tomar foto con la cámara',
                                  className:
                                    'w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-emerald-300 text-emerald-500 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40',
                                  children: [
                                    ee && J === k.id
                                      ? e.jsx(Ne, { size: 16, className: 'animate-spin' })
                                      : e.jsx(De, { size: 16 }),
                                    e.jsx('span', {
                                      className: 'text-[8px] font-black uppercase',
                                      children: 'Cámara'
                                    })
                                  ]
                                }),
                              !t &&
                                e.jsxs('button', {
                                  type: 'button',
                                  onClick: () => y(k.id, 'galeria'),
                                  disabled: ee,
                                  title: 'Subir foto desde archivos/galería',
                                  className:
                                    'w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40',
                                  children: [
                                    ee && J === k.id
                                      ? e.jsx(Ne, { size: 16, className: 'animate-spin' })
                                      : e.jsx(rs, { size: 16 }),
                                    e.jsx('span', {
                                      className: 'text-[8px] font-black uppercase',
                                      children: O ? 'Galería' : 'Foto'
                                    })
                                  ]
                                }),
                              z.length === 0 &&
                                t &&
                                e.jsx('span', {
                                  className: 'text-xs text-slate-300',
                                  children: 'Sin fotos'
                                })
                            ]
                          })
                        ]
                      },
                      k.id
                    );
                  })
                }),
                e.jsx('input', {
                  ref: Q,
                  type: 'file',
                  accept: 'image/*',
                  multiple: !0,
                  onChange: U,
                  className: 'hidden'
                }),
                F &&
                  e.jsx(ws, {
                    onCapture: (k) => U({ target: { files: [k], value: '' } }),
                    onClose: () => Z(!1)
                  }),
                e.jsx('p', {
                  className: 'text-[10px] text-slate-400 mt-2',
                  children:
                    'Las fotos quedan asociadas al certificado (bucket privado) y se incrustan en el PDF.'
                })
              ]
            }),
            (o || l) &&
              e.jsxs('div', {
                className: `rounded-2xl border p-5 ${o ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'}`,
                children: [
                  e.jsxs('label', {
                    className:
                      'text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-rose-500',
                    children: [
                      'Disposición / Acción a tomar ',
                      o && e.jsx('span', { children: '*obligatoria' })
                    ]
                  }),
                  e.jsxs('select', {
                    value: l,
                    disabled: t,
                    onChange: (k) => S(k.target.value),
                    className:
                      'mt-1.5 w-full px-3 py-2 rounded-xl border border-rose-200 text-sm font-bold outline-none focus:border-rose-400 bg-white',
                    children: [
                      e.jsx('option', { value: '', children: '— Seleccionar disposición —' }),
                      Fa.map((k) => e.jsx('option', { value: k, children: k }, k))
                    ]
                  })
                ]
              }),
            e.jsxs('div', {
              className: 'bg-white rounded-2xl border border-slate-200 p-5',
              children: [
                e.jsx('label', {
                  className: 'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                  children: 'Observaciones generales'
                }),
                e.jsx('textarea', {
                  value: M,
                  disabled: t,
                  onChange: (k) => w(k.target.value),
                  rows: 2,
                  placeholder: 'Notas de la certificación de salida…',
                  className:
                    'mt-1.5 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 resize-none'
                })
              ]
            })
          ]
        }),
        !t &&
          e.jsxs('div', {
            className:
              'sticky bottom-3 mt-5 bg-white rounded-2xl border border-slate-200 shadow-lg p-4 flex flex-wrap items-center justify-between gap-3',
            children: [
              e.jsx('div', {
                className: 'text-xs font-black',
                children:
                  f > 0
                    ? e.jsxs('span', {
                        className: 'text-slate-500',
                        children: [f, ' ítem(s) por responder']
                      })
                    : o
                      ? e.jsx('span', {
                          className: 'text-rose-600',
                          children: 'Resultado automático: NO CONFORME'
                        })
                      : e.jsx('span', {
                          className: 'text-emerald-600',
                          children: 'Resultado automático: CONFORME'
                        })
              }),
              e.jsxs('div', {
                className: 'flex flex-wrap gap-2',
                children: [
                  e.jsx('button', {
                    onClick: L,
                    disabled: c.isPending,
                    className:
                      'px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50',
                    children: 'Guardar avance'
                  }),
                  e.jsx('button', {
                    onClick: q,
                    disabled: c.isPending || f > 0,
                    className: `px-4 py-2.5 rounded-xl text-white font-black text-sm flex items-center gap-2 disabled:opacity-40 ${o ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`,
                    children: o
                      ? e.jsxs(e.Fragment, {
                          children: [e.jsx(Fs, { size: 16 }), ' Finalizar (No Conforme)']
                        })
                      : e.jsxs(e.Fragment, {
                          children: [e.jsx(We, { size: 16 }), ' Certificar salida']
                        })
                  })
                ]
              })
            ]
          }),
        s.estado === 'NO_CONFORME' &&
          e.jsxs('div', {
            className:
              'mt-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-2',
            children: [
              e.jsx(xe, { size: 16 }),
              ' Salida ',
              e.jsx('b', { children: 'NO CONFORME' }),
              '. No despachar hasta resolver.',
              s.disposicion ? ` Disposición: ${s.disposicion}.` : ''
            ]
          })
      ]
    });
  },
  Ot = () => {
    const { hasPermission: s, user: i } = ve(),
      d = s('manage_quality') || s('manage_monitoreo'),
      c = (i == null ? void 0 : i.rol) === 'ADMIN' || (i == null ? void 0 : i.es_admin_delegado),
      { data: C = [], isLoading: b, refetch: t, isFetching: m } = Ta(),
      g = Vs(),
      [E, p] = _.useState(null),
      [A, u] = _.useState(!1),
      [M, w] = _.useState(''),
      [l, S] = _.useState('TODOS'),
      $ = async (a, o) => {
        if (
          (o.stopPropagation(),
          !!confirm(
            `¿Eliminar la certificación de salida (NV ${a.oc || '—'})? Esta acción no se puede deshacer.`
          ))
        )
          try {
            (await g.mutateAsync(a.id), R.success('Certificación eliminada'));
          } catch (f) {
            R.error(`No se pudo eliminar: ${f.message}`);
          }
      },
      T = C.filter((a) => a.estado === 'PENDIENTE' || a.estado === 'EN_PROCESO').length,
      x = _.useMemo(() => {
        const a = M.trim().toLocaleLowerCase('es-CL');
        return C.filter((o) => {
          const f = o.contexto || {};
          return (
            (!a ||
              [o.oc, o.proveedor, o.folio, f.cliente, f.guia, f.transportista].some((v) =>
                String(v || '')
                  .toLocaleLowerCase('es-CL')
                  .includes(a)
              )) &&
            (l === 'TODOS' || o.estado === l)
          );
        });
      }, [M, l, C]),
      N = (E && C.find((a) => a.id === E)) || null;
    return N
      ? e.jsx(At, { tarea: N, onBack: () => p(null), canManage: d })
      : e.jsxs('div', {
          children: [
            e.jsxs('div', {
              className:
                'mb-4 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-4 shadow-sm',
              children: [
                e.jsxs('div', {
                  className: 'flex flex-wrap items-start justify-between gap-3',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('p', {
                          className:
                            'text-[10px] font-black uppercase tracking-[0.16em] text-teal-600',
                          children: 'Hito 3 · Salida'
                        }),
                        e.jsx('h2', {
                          className: 'mt-0.5 text-lg font-black text-slate-900',
                          children: 'Certificación antes de despacho'
                        }),
                        e.jsx('p', {
                          className: 'text-xs text-slate-500',
                          children: 'Busca por N.V., OC, cliente, proveedor, guía o folio.'
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      className: 'flex gap-2',
                      children: [
                        e.jsxs('button', {
                          onClick: () => t(),
                          disabled: m,
                          className:
                            'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                          children: [
                            e.jsx(Ne, { size: 14, className: m ? 'animate-spin' : '' }),
                            ' Actualizar'
                          ]
                        }),
                        d &&
                          e.jsxs('button', {
                            onClick: () => u(!0),
                            className:
                              'px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-emerald-700',
                            children: [e.jsx(Ps, { size: 14 }), ' Certificar salida (N.V. + SKU)']
                          })
                      ]
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2',
                  children: [
                    e.jsx(Xe, { label: 'Total', value: C.length, tone: 'slate' }),
                    e.jsx(Xe, { label: 'Por certificar', value: T, tone: 'amber' }),
                    e.jsx(Xe, { label: 'Emitidas', value: C.length - T, tone: 'emerald' })
                  ]
                }),
                e.jsxs('div', {
                  className: 'mt-4 flex flex-col lg:flex-row gap-2',
                  children: [
                    e.jsxs('label', {
                      className: 'relative flex-1',
                      children: [
                        e.jsx(ce, {
                          size: 16,
                          className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                        }),
                        e.jsx('input', {
                          value: M,
                          onChange: (a) => w(a.target.value),
                          placeholder: 'Buscar N.V., OC, proveedor, cliente o folio…',
                          className:
                            'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100'
                        })
                      ]
                    }),
                    e.jsx('div', {
                      className: 'flex gap-1 overflow-x-auto pb-0.5',
                      children: ['TODOS', 'PENDIENTE', 'EN_PROCESO', 'CONFORME', 'NO_CONFORME'].map(
                        (a) => {
                          var o;
                          return e.jsx(
                            'button',
                            {
                              onClick: () => S(a),
                              className: `whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-black tracking-wide transition ${l === a ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-200'}`,
                              children:
                                a === 'TODOS'
                                  ? 'Todos'
                                  : ((o = Se[a]) == null ? void 0 : o.label) || a
                            },
                            a
                          );
                        }
                      )
                    })
                  ]
                }),
                !b &&
                  e.jsxs('p', {
                    className: 'mt-2 text-[11px] font-bold text-slate-400',
                    children: ['Mostrando ', x.length, ' de ', C.length, ' certificaciones.']
                  })
              ]
            }),
            b
              ? e.jsx('div', {
                  className: 'flex justify-center py-20',
                  children: e.jsx(ne, { className: 'animate-spin text-emerald-500', size: 36 })
                })
              : C.length === 0
                ? e.jsxs('div', {
                    className: 'flex flex-col items-center justify-center py-20 text-center',
                    children: [
                      e.jsx(Je, { size: 44, className: 'text-slate-200 mb-4' }),
                      e.jsx('h3', {
                        className: 'text-base font-bold text-slate-400',
                        children: 'Sin certificaciones de salida'
                      }),
                      e.jsx('p', {
                        className: 'text-xs text-slate-300',
                        children:
                          'Usa “Certificar manual” (escribes la N.V. y agregas los SKUs) o “Desde despacho” para elegir uno existente.'
                      })
                    ]
                  })
                : x.length === 0
                  ? e.jsxs('div', {
                      className:
                        'rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center',
                      children: [
                        e.jsx(ce, { size: 34, className: 'mx-auto mb-3 text-slate-300' }),
                        e.jsx('h3', {
                          className: 'font-bold text-slate-500',
                          children: 'No hay certificaciones que coincidan'
                        }),
                        e.jsx('button', {
                          onClick: () => {
                            (w(''), S('TODOS'));
                          },
                          className: 'mt-2 text-xs font-black text-teal-600 hover:text-teal-700',
                          children: 'Limpiar filtros'
                        })
                      ]
                    })
                  : e.jsx('div', {
                      className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
                      children: x.map((a) => {
                        const o = Se[a.estado] || {},
                          f = a.contexto || {},
                          n = a.estado === 'PENDIENTE' || a.estado === 'EN_PROCESO';
                        return e.jsxs(
                          'div',
                          {
                            role: 'button',
                            tabIndex: 0,
                            onClick: () => p(a.id),
                            className: `cursor-pointer text-left bg-white rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${n ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-emerald-300'}`,
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center justify-between mb-3 gap-2',
                                children: [
                                  e.jsxs('span', {
                                    className:
                                      'flex items-center gap-1.5 font-black text-slate-900 truncate',
                                    children: [
                                      e.jsx($e, { size: 16, className: 'text-slate-400 shrink-0' }),
                                      a.proveedor || f.cliente || 'Sin cliente'
                                    ]
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-1.5 shrink-0',
                                    children: [
                                      e.jsx('span', {
                                        className: `text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${o.cls}`,
                                        children: o.label || a.estado
                                      }),
                                      c &&
                                        e.jsx('button', {
                                          onClick: (v) => $(a, v),
                                          title: 'Eliminar (admin)',
                                          className:
                                            'p-1.5 rounded-lg text-slate-300 hover:bg-rose-100 hover:text-rose-600',
                                          children: e.jsx(ie, { size: 14 })
                                        })
                                    ]
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'flex items-center gap-2 mb-2 flex-wrap',
                                children: [
                                  e.jsxs('span', {
                                    className:
                                      'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-teal-50 text-teal-700 border-teal-200',
                                    children: ['NV ', a.oc || f.nv || '—']
                                  }),
                                  a.folio &&
                                    e.jsx('span', {
                                      className:
                                        'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-600 border-emerald-200 font-mono',
                                      children: a.folio
                                    }),
                                  (a.estado === 'CONFORME' || a.estado === 'NO_CONFORME') &&
                                    (() => {
                                      const v = ye(a);
                                      return e.jsxs('span', {
                                        className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${v.cls}`,
                                        children: [v.emoji, ' ', v.label]
                                      });
                                    })()
                                ]
                              }),
                              e.jsxs('p', {
                                className: 'text-sm text-slate-500 font-medium',
                                children: ['Guía ', f.guia || '—', ' · ', a.fecha_recepcion || '—']
                              }),
                              a.bultos != null &&
                                e.jsxs('p', {
                                  className: 'text-xs text-slate-400 mt-1',
                                  children: [
                                    a.bultos,
                                    ' bultos ·',
                                    ' ',
                                    f.transportista || f.empresa_transporte || 's/transportista'
                                  ]
                                })
                            ]
                          },
                          a.id
                        );
                      })
                    }),
            A &&
              e.jsx(kt, {
                onClose: () => u(!1),
                onCreated: (a) => {
                  (u(!1), a && p(a));
                }
              })
          ]
        });
  },
  Xe = ({ label: s, value: i, tone: d }) => {
    const c = {
      slate: 'bg-white text-slate-800 border-slate-200',
      amber: 'bg-amber-50 text-amber-700 border-amber-200',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return e.jsxs('div', {
      className: `rounded-xl border px-3 py-2 ${c[d] || c.slate}`,
      children: [
        e.jsx('p', { className: 'text-lg font-black leading-none', children: i }),
        e.jsx('p', {
          className: 'mt-1 text-[9px] font-black uppercase tracking-widest opacity-70',
          children: s
        })
      ]
    });
  },
  St = () => {
    var s;
    return (s = globalThis.crypto) != null && s.randomUUID
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  },
  os = {
    ROJO: 'bg-rose-500',
    NARANJA: 'bg-amber-500',
    VERDE: 'bg-emerald-500',
    NA: 'bg-slate-300'
  },
  ra = {
    BORRADOR: 'bg-slate-100 text-slate-600 border-slate-200',
    ENVIADO_CALIDAD: 'bg-blue-100 text-blue-700 border-blue-200',
    DICTAMINADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CERRADO: 'bg-slate-800 text-white border-slate-800'
  },
  Ss = {
    MONITOREO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DANOS: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  Rt = ({ codigo: s, value: i, onSelect: d }) => {
    const [c, C] = _.useState(!1),
      [b, t] = _.useState(''),
      [m, g] = _.useState([]),
      [E, p] = _.useState(!1),
      A = Ds.useRef(null);
    (_.useEffect(() => {
      if (!c) return;
      let l = !0;
      p(!0);
      const S = setTimeout(async () => {
        try {
          const $ = await ot(s, b);
          l && g($);
        } catch {
          l && g([]);
        } finally {
          l && p(!1);
        }
      }, 220);
      return () => {
        ((l = !1), clearTimeout(S));
      };
    }, [c, b, s]),
      _.useEffect(() => {
        const l = (S) => {
          A.current && !A.current.contains(S.target) && C(!1);
        };
        return (
          c && document.addEventListener('mousedown', l),
          () => document.removeEventListener('mousedown', l)
        );
      }, [c]));
    const u = (l) => {
        (d(l.valor, l.ubicacion || ''), C(!1), t(''));
      },
      M = () => {
        b.trim() && (d(b.trim().toUpperCase(), ''), C(!1), t(''));
      },
      w = m.some((l) => (l.valor || '').toUpperCase() === b.trim().toUpperCase());
    return e.jsxs('div', {
      className: 'relative',
      ref: A,
      children: [
        e.jsxs('button', {
          type: 'button',
          onClick: () => C((l) => !l),
          className:
            'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-left outline-none hover:border-emerald-400 flex items-center justify-between gap-2',
          children: [
            e.jsx('span', {
              className: i ? 'text-slate-800 truncate' : 'text-slate-300',
              children: i || 'Elegir lote / serie…'
            }),
            e.jsx(ce, { size: 14, className: 'text-slate-400 shrink-0' })
          ]
        }),
        c &&
          e.jsxs('div', {
            className:
              'absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden',
            children: [
              e.jsx('div', {
                className: 'p-2 border-b border-slate-100',
                children: e.jsx('input', {
                  autoFocus: !0,
                  value: b,
                  onChange: (l) => t(l.target.value),
                  placeholder: 'Filtrar lote (P) o serie (S)…',
                  className:
                    'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-400'
                })
              }),
              e.jsx('div', {
                className: 'max-h-56 overflow-y-auto',
                children: E
                  ? e.jsxs('div', {
                      className: 'py-6 text-center text-xs text-slate-400',
                      children: [
                        e.jsx(ne, { size: 16, className: 'animate-spin inline mr-1' }),
                        ' Buscando…'
                      ]
                    })
                  : m.length === 0
                    ? e.jsxs('div', {
                        className: 'py-5 text-center text-xs text-slate-400',
                        children: ['Sin lotes/series ', b ? `para "${b}"` : '']
                      })
                    : m.map((l, S) =>
                        e.jsxs(
                          'button',
                          {
                            type: 'button',
                            onClick: () => u(l),
                            className:
                              'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-emerald-50/50 border-b border-slate-50 last:border-0',
                            children: [
                              e.jsx('span', {
                                className: `text-[9px] font-black px-1.5 py-0.5 rounded ${l.tipo === 'P' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`,
                                children: l.tipo === 'P' ? 'LOTE' : 'SERIE'
                              }),
                              e.jsx('span', {
                                className:
                                  'font-mono text-xs font-bold text-slate-800 truncate flex-1',
                                children: l.valor
                              }),
                              l.ubicacion &&
                                e.jsx('span', {
                                  className: 'text-[10px] text-slate-400 font-mono shrink-0',
                                  children: l.ubicacion
                                }),
                              e.jsx('span', {
                                className: `text-xs font-bold shrink-0 ${Number(l.disponible) > 0 ? 'text-emerald-600' : 'text-slate-300'}`,
                                children: Number(l.disponible) || 0
                              })
                            ]
                          },
                          S
                        )
                      )
              }),
              b.trim() &&
                !w &&
                e.jsxs('button', {
                  type: 'button',
                  onClick: M,
                  className:
                    'w-full px-3 py-2.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border-t border-amber-100 flex items-center gap-2',
                  children: [
                    e.jsx(fe, { size: 13 }),
                    ' No está en la lista — usar «',
                    b.trim().toUpperCase(),
                    '» manualmente'
                  ]
                })
            ]
          })
      ]
    });
  },
  Rs = ({ informe: s, prefillItems: i, asignacionId: d, onCancel: c, onSaved: C }) => {
    const { user: b } = ve(),
      t = na(),
      m = !!s,
      g = Ka(),
      E = qa(),
      p = Ja(),
      { data: A } = hs(m ? s.id : null),
      [u, M] = _.useState((s == null ? void 0 : s.bodega) || ''),
      [w, l] = _.useState((s == null ? void 0 : s.periodicidad) || 'SEMANAL'),
      [S, $] = _.useState((s == null ? void 0 : s.observaciones) || ''),
      [T, x] = _.useState(''),
      [N, a] = _.useState(!1),
      [o, f] = _.useState([]),
      [n, v] = _.useState(!1),
      [h, L] = _.useState([]),
      [q, Q] = _.useState(null),
      F = _.useRef(!1);
    _.useEffect(() => {
      m &&
        A &&
        !F.current &&
        ((F.current = !0),
        L(
          A.map((r) => ({
            _key: `${r.codigo_producto}|${r.partida || ''}|${r.ubicacion || ''}`,
            codigo_producto: r.codigo_producto,
            partida: r.partida || '',
            ubicacion: r.ubicacion || '',
            producto: r.producto || '',
            unidad_medida: r.unidad_medida || '',
            cantidad: Number(r.cantidad) || 0,
            estado_inventario: r.estado_inventario || 'Disponible',
            tipo: r.tipo || 'NO_PERECIBLE',
            fecha_vencimiento: r.fecha_vencimiento || null,
            semaforo: r.semaforo || 'NA',
            condicion_observada: r.condicion_observada || 'OK',
            cantidad_afectada: Number(r.cantidad_afectada) || 0,
            no_registrado: !!r.no_registrado,
            motivo: r.motivo || 'Rutina',
            observaciones: r.observaciones || ''
          }))
        ));
    }, [m, A]);
    const Z = _.useRef(!1);
    _.useEffect(() => {
      !m &&
        Array.isArray(i) &&
        i.length &&
        !Z.current &&
        ((Z.current = !0),
        L(
          i.map((r) => ({
            _key: `${r.codigo_producto}|${r.partida || ''}|${r.ubicacion || ''}`,
            codigo_producto: r.codigo_producto,
            partida: r.partida || '',
            ubicacion: r.ubicacion || '',
            producto: r.producto || '',
            unidad_medida: r.unidad_medida || 'UN',
            cantidad: Number(r.cantidad) || 0,
            estado_inventario: 'Disponible',
            tipo: r.tipo || 'NO_PERECIBLE',
            fecha_vencimiento: r.fecha_vencimiento || null,
            semaforo: r.semaforo || 'NA',
            condicion_observada: 'OK',
            cantidad_afectada: 0,
            no_registrado: !1,
            motivo: 'Hallazgo',
            observaciones: ''
          }))
        ));
    }, [m, i]);
    const O = _.useCallback(async () => {
        v(!0);
        try {
          const r = await bs(T, N);
          f(r);
        } catch (r) {
          R.error(`Error buscando stock: ${r.message}`);
        } finally {
          v(!1);
        }
      }, [T, N]),
      J = (r) => {
        const B = `${r.codigo_producto}|${r.partida || ''}|${r.ubicacion || ''}`;
        if (h.some((G) => G._key === B)) {
          R.info('Ese ítem ya está en el informe');
          return;
        }
        L((G) => [
          ...G,
          {
            _key: B,
            codigo_producto: r.codigo_producto,
            partida: r.partida || '',
            ubicacion: r.ubicacion || '',
            producto: r.producto || '',
            unidad_medida: r.unidad_medida || '',
            cantidad: Number(r.disponible) || 0,
            estado_inventario: 'Disponible',
            tipo: r.tipo || 'NO_PERECIBLE',
            fecha_vencimiento: r.fecha_vencimiento || null,
            semaforo: r.semaforo || 'NA',
            condicion_observada: 'OK',
            cantidad_afectada: 0,
            no_registrado: !1,
            motivo: 'Rutina',
            observaciones: ''
          }
        ]);
      },
      X = () => {
        const r = (q.codigo || '').trim().toUpperCase(),
          B = (q.ubicacion || '').trim().toUpperCase();
        if (!r) {
          R.error('Ingresa el código del producto');
          return;
        }
        if (!B) {
          R.error('La ubicación es obligatoria');
          return;
        }
        const G = `MAN|${r}|${(q.partida || '').trim()}|${B}`;
        if (h.some((P) => P._key === G)) {
          R.info('Ese ítem ya está en el informe');
          return;
        }
        (L((P) => [
          ...P,
          {
            _key: G,
            codigo_producto: r,
            partida: (q.partida || '').trim().toUpperCase(),
            ubicacion: B,
            producto: (q.producto || '').trim() || 'SIN DESCRIPCIÓN',
            unidad_medida: 'UN',
            cantidad: Number(q.cantidad) || 0,
            estado_inventario: 'No registrado',
            tipo: 'NO_PERECIBLE',
            fecha_vencimiento: null,
            semaforo: 'NA',
            condicion_observada: 'Sobrante',
            cantidad_afectada: Number(q.cantidad) || 0,
            no_registrado: !0,
            motivo: 'Hallazgo',
            observaciones: ''
          }
        ]),
          Q(null),
          R.success('Ítem manual agregado (no registrado)'));
      },
      ee = (r, B, G) => {
        L((P) => P.map((re) => (re._key === r ? { ...re, [B]: G } : re)));
      },
      D = (r, B) =>
        L((G) =>
          G.map((P) =>
            P._key === r
              ? { ...P, condicion_observada: B, ...(B === 'OK' ? { cantidad_afectada: 0 } : {}) }
              : P
          )
        ),
      H = (r) => L((B) => B.filter((G) => G._key !== r)),
      Y = async (r) => {
        if (h.length === 0) {
          R.error('Agrega al menos un ítem');
          return;
        }
        if (r === 'ENVIADO_CALIDAD') {
          const G = h.filter((P) => !(P.ubicacion || '').trim());
          if (G.length > 0) {
            R.error(`${G.length} ítem(s) sin ubicación. Es obligatoria para enviar a Calidad.`);
            return;
          }
        }
        const B = h.map(({ _key: G, ...P }) => P);
        try {
          let G = m ? s.id : null;
          if (m) {
            const P = { bodega: u || null, periodicidad: w, estado: r, observaciones: S || null };
            (await E.mutateAsync({ informeId: s.id, cabecera: P, items: B }),
              R.success('Informe actualizado'));
          } else {
            const P = {
                fecha: new Date().toISOString().slice(0, 10),
                analista_id: (b == null ? void 0 : b.id) || null,
                analista_nombre: (b == null ? void 0 : b.nombre) || null,
                bodega: u || null,
                periodicidad: w,
                estado: r,
                observaciones: S || null
              },
              re = await g.mutateAsync({ cabecera: P, items: B });
            if (
              ((G = (re == null ? void 0 : re.id) || null),
              R.success(
                r === 'ENVIADO_CALIDAD' ? 'Informe enviado a Calidad' : 'Borrador guardado'
              ),
              d && G)
            )
              try {
                (await p.mutateAsync({ asignacionId: d, informeId: G, estado: 'RESUELTA' }),
                  R.success('Asignación de estancia resuelta'));
              } catch (me) {
                (console.error('resolver asignación', me),
                  R.error(`No se pudo enlazar la asignación: ${me.message}`));
              }
          }
          if (r === 'ENVIADO_CALIDAD' && G)
            try {
              const P = await rt(G);
              ((P == null ? void 0 : P.flags) > 0 &&
                (t.invalidateQueries({ queryKey: ['calidad_flags'] }),
                R.info(`${P.flags} ubicación(es) marcadas "En Auditoría"`)),
                (P == null ? void 0 : P.alertas) > 0 &&
                  (R.warning(`${P.alertas} alerta(s) a Inventario por SKU no registrado`),
                  nt(P.alertas, G)));
            } catch (P) {
              console.error('preliminar', P);
            }
          C();
        } catch (G) {
          R.error(`Error al guardar: ${G.message}`);
        }
      },
      W = h.filter((r) => !(r.ubicacion || '').trim()).length,
      y = (r, B) =>
        B
          ? r === 'OK'
            ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
            : 'bg-amber-100 text-amber-800 border-amber-300'
          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100',
      U = g.isPending || E.isPending;
    return e.jsxs('div', {
      className: 'space-y-5',
      children: [
        e.jsxs('div', {
          className: 'flex items-center gap-4',
          children: [
            e.jsx('button', {
              onClick: c,
              className:
                'p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm',
              children: e.jsx(Le, { size: 22 })
            }),
            e.jsx('h2', {
              className: 'text-2xl font-black text-slate-900',
              children: m ? `Editar Informe ${s.numero}` : 'Nuevo Informe de Monitoreo'
            })
          ]
        }),
        m &&
          s.estado === 'DICTAMINADO' &&
          e.jsxs('div', {
            className:
              'flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm',
            children: [
              e.jsx(xe, { size: 18, className: 'shrink-0 mt-0.5' }),
              e.jsxs('span', {
                children: [
                  'Este informe ya fue dictaminado. Al guardar, los ítems se reemplazan y se',
                  ' ',
                  e.jsx('b', { children: 'reinician los dictámenes' }),
                  ' (el overlay de calidad ya registrado se conserva).'
                ]
              })
            ]
          }),
        e.jsxs('div', {
          className:
            'bg-white rounded-2xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-4 gap-4',
          children: [
            e.jsxs('div', {
              children: [
                e.jsx('label', {
                  className: 'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                  children: 'Bodega'
                }),
                e.jsx('input', {
                  value: u,
                  onChange: (r) => M(r.target.value),
                  placeholder: 'Ej. BD 21',
                  className:
                    'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400'
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', {
                  className: 'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                  children: 'Periodicidad'
                }),
                e.jsxs('select', {
                  value: w,
                  onChange: (r) => l(r.target.value),
                  className:
                    'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400',
                  children: [
                    e.jsx('option', { value: 'SEMANAL', children: 'Semanal' }),
                    e.jsx('option', { value: 'MENSUAL', children: 'Mensual' }),
                    e.jsx('option', { value: 'ADHOC', children: 'Ad-hoc' })
                  ]
                })
              ]
            }),
            e.jsxs('div', {
              className: 'sm:col-span-2',
              children: [
                e.jsx('label', {
                  className: 'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                  children: 'Observaciones'
                }),
                e.jsx('input', {
                  value: S,
                  onChange: (r) => $(r.target.value),
                  placeholder: 'Notas generales del informe',
                  className:
                    'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400'
                })
              ]
            })
          ]
        }),
        e.jsxs('div', {
          className: 'bg-white rounded-2xl border border-slate-200 p-5',
          children: [
            e.jsxs('div', {
              className: 'flex flex-col sm:flex-row gap-3',
              children: [
                e.jsxs('div', {
                  className: 'relative flex-1',
                  children: [
                    e.jsx(ce, {
                      size: 18,
                      className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-300'
                    }),
                    e.jsx('input', {
                      value: T,
                      onChange: (r) => x(r.target.value),
                      onKeyDown: (r) => r.key === 'Enter' && O(),
                      placeholder: 'Buscar SKU o descripción en stock...',
                      className:
                        'w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400'
                    })
                  ]
                }),
                e.jsxs('label', {
                  className: 'flex items-center gap-2 text-xs font-bold text-slate-500 px-2',
                  children: [
                    e.jsx('input', {
                      type: 'checkbox',
                      checked: N,
                      onChange: (r) => a(r.target.checked)
                    }),
                    'Solo 🔴/🟠 (próx. a vencer)'
                  ]
                }),
                e.jsxs('button', {
                  onClick: O,
                  disabled: n,
                  className:
                    'px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700 disabled:opacity-50',
                  children: [
                    n
                      ? e.jsx(ne, { size: 16, className: 'animate-spin' })
                      : e.jsx(ce, { size: 16 }),
                    ' ',
                    'Buscar'
                  ]
                })
              ]
            }),
            o.length > 0 &&
              e.jsx('div', {
                className:
                  'mt-4 max-h-64 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50',
                children: o.map((r, B) =>
                  e.jsxs(
                    'div',
                    {
                      className:
                        'flex items-center justify-between px-4 py-2.5 text-sm hover:bg-emerald-50/40',
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center gap-3 min-w-0',
                          children: [
                            e.jsx('span', {
                              className: `w-2.5 h-2.5 rounded-full ${os[r.semaforo] || 'bg-slate-300'}`
                            }),
                            e.jsx('span', {
                              className:
                                'font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 shrink-0',
                              children: r.codigo_producto
                            }),
                            e.jsx('span', {
                              className: 'text-slate-600 truncate',
                              children: r.producto
                            }),
                            r.partida &&
                              e.jsxs('span', {
                                className: 'text-[10px] text-slate-400',
                                children: ['lote ', r.partida]
                              }),
                            r.ubicacion &&
                              e.jsxs('span', {
                                className: 'text-[10px] text-slate-400',
                                children: ['· ', r.ubicacion]
                              })
                          ]
                        }),
                        e.jsx('button', {
                          onClick: () => J(r),
                          className:
                            'ml-3 p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shrink-0',
                          children: e.jsx(fe, { size: 16 })
                        })
                      ]
                    },
                    B
                  )
                )
              })
          ]
        }),
        e.jsxs('div', {
          className: 'bg-white rounded-2xl border border-slate-200 p-5',
          children: [
            e.jsxs('div', {
              className: 'flex items-center justify-between gap-2 mb-3 flex-wrap',
              children: [
                e.jsxs('h3', {
                  className: 'text-sm font-black text-slate-700',
                  children: ['Ítems del informe (', h.length, ')']
                }),
                e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    W > 0 &&
                      e.jsxs('span', {
                        className:
                          'text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full flex items-center gap-1',
                        children: [e.jsx(xe, { size: 12 }), ' ', W, ' sin ubicación']
                      }),
                    e.jsxs('button', {
                      type: 'button',
                      onClick: () =>
                        Q(
                          q
                            ? null
                            : { codigo: '', producto: '', ubicacion: '', partida: '', cantidad: 1 }
                        ),
                      className:
                        'text-xs font-bold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5',
                      children: [e.jsx(fe, { size: 13 }), ' Agregar manual']
                    })
                  ]
                })
              ]
            }),
            q &&
              e.jsxs('div', {
                className: 'mb-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2 mb-3 text-amber-800',
                    children: [
                      e.jsx(xe, { size: 15 }),
                      e.jsx('span', {
                        className: 'text-sm font-black',
                        children: 'Agregar producto NO registrado en sistema'
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-2 sm:grid-cols-4 gap-3',
                    children: [
                      e.jsxs('div', {
                        className: 'col-span-1',
                        children: [
                          e.jsx('label', {
                            className:
                              'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                            children: 'Código *'
                          }),
                          e.jsx('input', {
                            value: q.codigo,
                            onChange: (r) =>
                              Q((B) => ({ ...B, codigo: r.target.value.toUpperCase() })),
                            className:
                              'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold outline-none focus:border-amber-400',
                            placeholder: 'SKU'
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'col-span-1',
                        children: [
                          e.jsx('label', {
                            className:
                              'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                            children: 'Ubicación *'
                          }),
                          e.jsx('input', {
                            value: q.ubicacion,
                            onChange: (r) =>
                              Q((B) => ({ ...B, ubicacion: r.target.value.toUpperCase() })),
                            className:
                              'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold outline-none focus:border-amber-400',
                            placeholder: 'A-12-03'
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'col-span-1',
                        children: [
                          e.jsx('label', {
                            className:
                              'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                            children: 'Lote / Serie'
                          }),
                          e.jsx('input', {
                            value: q.partida,
                            onChange: (r) =>
                              Q((B) => ({ ...B, partida: r.target.value.toUpperCase() })),
                            className:
                              'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono outline-none focus:border-amber-400',
                            placeholder: 'opcional'
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'col-span-1',
                        children: [
                          e.jsx('label', {
                            className:
                              'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                            children: 'Cantidad'
                          }),
                          e.jsx('input', {
                            type: 'number',
                            min: '0',
                            value: q.cantidad,
                            onChange: (r) =>
                              Q((B) => ({ ...B, cantidad: Number(r.target.value) || 0 })),
                            className:
                              'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-amber-400'
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'col-span-2 sm:col-span-4',
                        children: [
                          e.jsx('label', {
                            className:
                              'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                            children: 'Descripción (opcional)'
                          }),
                          e.jsx('input', {
                            value: q.producto,
                            onChange: (r) => Q((B) => ({ ...B, producto: r.target.value })),
                            className:
                              'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400',
                            placeholder: 'Nombre del producto'
                          })
                        ]
                      })
                    ]
                  }),
                  e.jsxs('p', {
                    className: 'text-[11px] text-amber-700 mt-2 flex items-center gap-1.5',
                    children: [
                      e.jsx(xe, { size: 12 }),
                      ' Al enviar a Calidad se generará una alerta a Inventario para dar de alta este ítem.'
                    ]
                  }),
                  e.jsxs('div', {
                    className: 'flex justify-end gap-2 mt-3',
                    children: [
                      e.jsx('button', {
                        onClick: () => Q(null),
                        className:
                          'px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-white',
                        children: 'Cancelar'
                      }),
                      e.jsxs('button', {
                        onClick: X,
                        className:
                          'px-4 py-2 rounded-xl bg-amber-600 text-white font-black text-sm hover:bg-amber-700 flex items-center gap-1.5',
                        children: [e.jsx(fe, { size: 15 }), ' Agregar']
                      })
                    ]
                  })
                ]
              }),
            h.length === 0
              ? e.jsx('p', {
                  className: 'text-sm text-slate-400 py-6 text-center',
                  children: 'Busca y agrega productos al informe.'
                })
              : e.jsx('div', {
                  className: 'space-y-3',
                  children: h.map((r) => {
                    const B = r.condicion_observada !== 'OK',
                      G = !(r.ubicacion || '').trim();
                    return e.jsxs(
                      'div',
                      {
                        className: `rounded-xl border p-4 ${B ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`,
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-start justify-between gap-3 mb-3',
                            children: [
                              e.jsxs('div', {
                                className: 'min-w-0',
                                children: [
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-2 flex-wrap',
                                    children: [
                                      e.jsx('span', {
                                        className: `w-2 h-2 rounded-full ${os[r.semaforo] || 'bg-slate-300'}`
                                      }),
                                      e.jsx('span', {
                                        className:
                                          'font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-100',
                                        children: r.codigo_producto
                                      }),
                                      r.no_registrado &&
                                        e.jsx('span', {
                                          className:
                                            'text-[9px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded uppercase tracking-wide',
                                          children: 'No registrado'
                                        }),
                                      e.jsx('span', {
                                        className: 'text-sm text-slate-600 truncate',
                                        children: r.producto
                                      })
                                    ]
                                  }),
                                  e.jsxs('span', {
                                    className: 'text-[10px] text-slate-400',
                                    children: [
                                      r.unidad_medida || 'UN',
                                      r.fecha_vencimiento ? ` · vence ${r.fecha_vencimiento}` : ''
                                    ]
                                  })
                                ]
                              }),
                              e.jsx('button', {
                                onClick: () => H(r._key),
                                className:
                                  'p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 shrink-0',
                                children: e.jsx(ie, { size: 15 })
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3',
                            children: [
                              e.jsxs('div', {
                                className: 'col-span-2',
                                children: [
                                  e.jsx('label', {
                                    className:
                                      'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                                    children: 'Lote / Serie'
                                  }),
                                  e.jsx(Rt, {
                                    codigo: r.codigo_producto,
                                    value: r.partida,
                                    onSelect: (P, re) => {
                                      (ee(r._key, 'partida', P), re && ee(r._key, 'ubicacion', re));
                                    }
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'col-span-2',
                                children: [
                                  e.jsxs('label', {
                                    className:
                                      'text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1',
                                    children: [
                                      'Ubicación ',
                                      G &&
                                        e.jsx('span', {
                                          className: 'text-rose-500',
                                          children: '*obligatoria'
                                        })
                                    ]
                                  }),
                                  e.jsx('input', {
                                    value: r.ubicacion,
                                    onChange: (P) =>
                                      ee(r._key, 'ubicacion', P.target.value.toUpperCase()),
                                    placeholder: 'Ej. A-12-03',
                                    className: `w-full mt-1 px-3 py-2 rounded-xl border text-sm font-mono font-bold outline-none focus:border-emerald-400 ${G ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'}`
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', {
                                    className:
                                      'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                                    children: 'Cant. total'
                                  }),
                                  e.jsx('input', {
                                    type: 'number',
                                    min: '0',
                                    value: r.cantidad,
                                    onChange: (P) =>
                                      ee(r._key, 'cantidad', Number(P.target.value) || 0),
                                    className:
                                      'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400'
                                  })
                                ]
                              }),
                              B &&
                                e.jsxs('div', {
                                  children: [
                                    e.jsx('label', {
                                      className:
                                        'text-[10px] font-black text-amber-500 uppercase tracking-widest',
                                      children: 'Uds afectadas'
                                    }),
                                    e.jsx('input', {
                                      type: 'number',
                                      min: '0',
                                      max: r.cantidad,
                                      value: r.cantidad_afectada,
                                      onChange: (P) =>
                                        ee(
                                          r._key,
                                          'cantidad_afectada',
                                          Number(P.target.value) || 0
                                        ),
                                      className:
                                        'w-full mt-1 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/50 text-sm font-bold text-amber-800 outline-none focus:border-amber-400'
                                    })
                                  ]
                                })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'mb-3',
                            children: [
                              e.jsx('label', {
                                className:
                                  'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                                children: 'Condición observada'
                              }),
                              e.jsx('div', {
                                className: 'flex flex-wrap gap-1.5 mt-1.5',
                                children: Wa.map((P) =>
                                  e.jsxs(
                                    'button',
                                    {
                                      type: 'button',
                                      onClick: () => D(r._key, P),
                                      className: `text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${y(P, r.condicion_observada === P)}`,
                                      children: [
                                        P !== 'OK' &&
                                          r.condicion_observada === P &&
                                          e.jsx(xe, { size: 11, className: 'inline mr-1 -mt-0.5' }),
                                        P
                                      ]
                                    },
                                    P
                                  )
                                )
                              })
                            ]
                          }),
                          e.jsx('div', {
                            className: 'flex flex-col sm:flex-row gap-2',
                            children: e.jsx('input', {
                              value: r.observaciones,
                              onChange: (P) => ee(r._key, 'observaciones', P.target.value),
                              placeholder: 'Nota / observación',
                              className:
                                'flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400'
                            })
                          }),
                          B &&
                            !G &&
                            e.jsxs('p', {
                              className:
                                'mt-2 text-[11px] text-amber-700 bg-amber-100/60 rounded-lg px-3 py-1.5 flex items-center gap-1.5',
                              children: [
                                e.jsx(xe, { size: 12 }),
                                ' Al enviar,',
                                ' ',
                                e.jsx('b', { className: 'font-mono', children: r.ubicacion }),
                                ' se marcará "En Auditoría" en Ubicaciones.'
                              ]
                            })
                        ]
                      },
                      r._key
                    );
                  })
                }),
            e.jsxs('div', {
              className: 'flex justify-end gap-3 mt-5',
              children: [
                e.jsx('button', {
                  onClick: () => Y(m ? s.estado : 'BORRADOR'),
                  disabled: U,
                  className:
                    'px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 disabled:opacity-50',
                  children: m ? 'Guardar cambios' : 'Guardar borrador'
                }),
                !m &&
                  e.jsxs('button', {
                    onClick: () => Y('ENVIADO_CALIDAD'),
                    disabled: U,
                    className:
                      'px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50',
                    children: [
                      U
                        ? e.jsx(ne, { size: 16, className: 'animate-spin' })
                        : e.jsx(Bs, { size: 16 }),
                      ' Enviar a Calidad'
                    ]
                  })
              ]
            })
          ]
        })
      ]
    });
  },
  Is = {
    clasificacion: Ws[0],
    area_responsable: 'Control de Operaciones — Recepción de Mercancías',
    fecha_recepcion: new Date().toISOString().slice(0, 10),
    tipo_producto: '',
    antecedentes: '',
    descripcion_hallazgo: '',
    analisis_causa: '',
    acciones_recomendadas: [''],
    cuadro_resumen: [{ indicador: '', valor: '' }],
    elaborado_por: '',
    revisado_por: ''
  },
  zs = ({ informe: s, prefill: i, onCancel: d, onSaved: c }) => {
    var W;
    const { user: C } = ve(),
      b = Qa(),
      { data: t } = hs((s == null ? void 0 : s.id) || null),
      m =
        !s && i
          ? {
              antecedentes: `Recepción ${i.oc || 's/OC'} de ${i.proveedor || 's/proveedor'} (${i.origen === 'NACIONAL' ? 'Nacional' : 'Importación'}) resultó NO CONFORME en el CheckList de ingreso. Se levanta el presente Informe de Daños / Solicitud de No Conformidad al proveedor.`,
              fecha_recepcion: i.fecha_recepcion || Is.fecha_recepcion
            }
          : {},
      [g, E] = _.useState((s == null ? void 0 : s.id) || null),
      [p, A] = _.useState((s == null ? void 0 : s.numero) || ''),
      [u, M] = _.useState((s == null ? void 0 : s.bodega) || ''),
      [w, l] = _.useState((s == null ? void 0 : s.estado) || 'BORRADOR'),
      [S, $] = _.useState({
        ...Is,
        ...((s == null ? void 0 : s.reporte) || {}),
        ...m,
        elaborado_por:
          ((W = s == null ? void 0 : s.reporte) == null ? void 0 : W.elaborado_por) ||
          (C == null ? void 0 : C.nombre) ||
          ''
      }),
      [T, x] = _.useState([]),
      { data: N = [], refetch: a } = Za(g),
      o = _.useRef(!1);
    _.useEffect(() => {
      s != null &&
        s.id &&
        t &&
        !o.current &&
        ((o.current = !0),
        x(
          t.map((y) => ({
            id: y.id,
            _key: y.id,
            codigo_producto: y.codigo_producto || '',
            producto: y.producto || '',
            partida: y.partida || '',
            ubicacion: y.ubicacion || '',
            unidad_medida: y.unidad_medida || '',
            cantidad: Number(y.cantidad) || 0,
            tipo_dano: y.tipo_dano || '',
            componente_afectado: y.componente_afectado || '',
            consecuencia: y.consecuencia || '',
            observaciones: y.observaciones || ''
          }))
        ));
    }, [s == null ? void 0 : s.id, t]);
    const f = (y, U) => $((r) => ({ ...r, [y]: U })),
      n = () =>
        x((y) => [
          ...y,
          {
            _key: `tmp-${St()}`,
            codigo_producto: '',
            producto: '',
            partida: '',
            ubicacion: '',
            unidad_medida: '',
            cantidad: 0,
            tipo_dano: '',
            componente_afectado: '',
            consecuencia: '',
            observaciones: ''
          }
        ]),
      v = (y, U, r) => x((B) => B.map((G) => (G._key === y ? { ...G, [U]: r } : G))),
      h = (y) => x((U) => U.filter((r) => r._key !== y)),
      L = () =>
        $((y) => ({
          ...y,
          cuadro_resumen: [...(y.cuadro_resumen || []), { indicador: '', valor: '' }]
        })),
      q = (y, U, r) =>
        $((B) => ({
          ...B,
          cuadro_resumen: B.cuadro_resumen.map((G, P) => (P === y ? { ...G, [U]: r } : G))
        })),
      Q = (y) => $((U) => ({ ...U, cuadro_resumen: U.cuadro_resumen.filter((r, B) => B !== y) })),
      F = () =>
        $((y) => ({ ...y, acciones_recomendadas: [...(y.acciones_recomendadas || []), ''] })),
      Z = (y, U) =>
        $((r) => ({
          ...r,
          acciones_recomendadas: r.acciones_recomendadas.map((B, G) => (G === y ? U : B))
        })),
      O = (y) =>
        $((U) => ({
          ...U,
          acciones_recomendadas: U.acciones_recomendadas.filter((r, B) => B !== y)
        })),
      J = async (y) => {
        const U = y || w;
        try {
          const r = g
              ? {
                  bodega: u || null,
                  periodicidad: 'ADHOC',
                  estado: U,
                  observaciones: S.descripcion_hallazgo || null
                }
              : {
                  fecha: new Date().toISOString().slice(0, 10),
                  analista_id: (C == null ? void 0 : C.id) || null,
                  analista_nombre: (C == null ? void 0 : C.nombre) || null,
                  bodega: u || null,
                  periodicidad: 'ADHOC',
                  estado: U,
                  observaciones: S.descripcion_hallazgo || null
                },
            B = T.map(({ _key: P, ...re }) => re),
            G = await b.mutateAsync({ informeId: g, cabecera: r, reporte: S, hallazgos: B });
          (E(G.id),
            G.numero && A(G.numero),
            l(U),
            x(G.hallazgos.map((P) => ({ ...P, _key: P.id }))),
            a(),
            R.success('Informe de daños guardado'));
        } catch (r) {
          R.error(`Error al guardar: ${r.message}`);
        }
      },
      X = {
        id: g,
        numero: p,
        fecha: (s == null ? void 0 : s.fecha) || S.fecha_recepcion,
        bodega: u,
        analista_nombre: S.elaborado_por || (C == null ? void 0 : C.nombre),
        reporte: S
      },
      ee = async (y) => {
        if (!g) {
          R.error('Guarda el informe antes de exportar');
          return;
        }
        try {
          y === 'word' ? await ut(X, T, N) : await bt(X, T, N);
        } catch (U) {
          R.error(`Error al exportar: ${U.message}`);
        }
      },
      D =
        'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-400',
      H = 'text-[10px] font-black text-slate-400 uppercase tracking-widest',
      Y = (y) => N.filter((U) => U.item_id === y);
    return e.jsxs('div', {
      className: 'space-y-5',
      children: [
        e.jsxs('div', {
          className: 'flex flex-wrap items-center justify-between gap-3',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-4',
              children: [
                e.jsx('button', {
                  onClick: d,
                  className:
                    'p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm',
                  children: e.jsx(Le, { size: 22 })
                }),
                e.jsx('h2', {
                  className: 'text-2xl font-black text-slate-900',
                  children: g ? `Informe de Daños ${p}` : 'Nuevo Informe de Daños'
                })
              ]
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-2',
              children: [
                e.jsxs('button', {
                  onClick: () => ee('word'),
                  disabled: !g,
                  className:
                    'px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-blue-700 disabled:opacity-40',
                  children: [e.jsx(Oe, { size: 16 }), ' Word']
                }),
                e.jsxs('button', {
                  onClick: () => ee('pdf'),
                  disabled: !g,
                  className:
                    'px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-rose-700 disabled:opacity-40',
                  children: [e.jsx(Gs, { size: 16 }), ' PDF']
                })
              ]
            })
          ]
        }),
        e.jsxs('div', {
          className:
            'bg-white rounded-2xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4',
          children: [
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: H, children: 'Fecha de recepción' }),
                e.jsx('input', {
                  type: 'date',
                  value: S.fecha_recepcion || '',
                  onChange: (y) => f('fecha_recepcion', y.target.value),
                  className: D
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: H, children: 'Tipo de producto' }),
                e.jsx('input', {
                  value: S.tipo_producto,
                  onChange: (y) => f('tipo_producto', y.target.value),
                  placeholder: 'Ej. Biombos (divisores modulares)',
                  className: D
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: H, children: 'Área responsable' }),
                e.jsx('input', {
                  value: S.area_responsable,
                  onChange: (y) => f('area_responsable', y.target.value),
                  className: D
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: H, children: 'Clasificación' }),
                e.jsx('select', {
                  value: S.clasificacion,
                  onChange: (y) => f('clasificacion', y.target.value),
                  className: D,
                  children: Ws.map((y) => e.jsx('option', { value: y, children: y }, y))
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: H, children: 'Bodega' }),
                e.jsx('input', {
                  value: u,
                  onChange: (y) => M(y.target.value),
                  placeholder: 'Ej. BD 21',
                  className: D
                })
              ]
            })
          ]
        }),
        e.jsxs('div', {
          className: 'bg-white rounded-2xl border border-slate-200 p-5 space-y-4',
          children: [
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: H, children: '1. Antecedentes' }),
                e.jsx('textarea', {
                  rows: 3,
                  value: S.antecedentes,
                  onChange: (y) => f('antecedentes', y.target.value),
                  className: D
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: H, children: '2. Descripción del hallazgo' }),
                e.jsx('textarea', {
                  rows: 3,
                  value: S.descripcion_hallazgo,
                  onChange: (y) => f('descripcion_hallazgo', y.target.value),
                  className: D
                })
              ]
            })
          ]
        }),
        e.jsxs('div', {
          className: 'bg-white rounded-2xl border border-slate-200 p-5',
          children: [
            e.jsxs('div', {
              className: 'flex items-center justify-between mb-3',
              children: [
                e.jsxs('h3', {
                  className: 'text-sm font-black text-slate-700',
                  children: ['3. Daños identificados (', T.length, ')']
                }),
                e.jsxs('button', {
                  onClick: n,
                  className:
                    'px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-slate-700',
                  children: [e.jsx(fe, { size: 14 }), ' Agregar hallazgo']
                })
              ]
            }),
            T.length === 0
              ? e.jsx('p', {
                  className: 'text-sm text-slate-400 py-6 text-center',
                  children: 'Agrega los hallazgos de daño con sus fotos de evidencia.'
                })
              : e.jsx('div', {
                  className: 'space-y-4',
                  children: T.map((y, U) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'border border-slate-200 rounded-xl p-4',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center justify-between mb-3',
                            children: [
                              e.jsxs('span', {
                                className: 'text-xs font-black text-rose-600',
                                children: ['Hallazgo 3.', U + 1]
                              }),
                              e.jsx('button', {
                                onClick: () => h(y._key),
                                className:
                                  'p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50',
                                children: e.jsx(ie, { size: 15 })
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'grid grid-cols-1 sm:grid-cols-3 gap-3',
                            children: [
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', { className: H, children: 'Tipo de daño' }),
                                  e.jsx('input', {
                                    value: y.tipo_dano,
                                    onChange: (r) => v(y._key, 'tipo_dano', r.target.value),
                                    placeholder: 'Deformación por aplastamiento',
                                    className: D
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', { className: H, children: 'Componente afectado' }),
                                  e.jsx('input', {
                                    value: y.componente_afectado,
                                    onChange: (r) =>
                                      v(y._key, 'componente_afectado', r.target.value),
                                    placeholder: 'Pilar / Panel',
                                    className: D
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', { className: H, children: 'Cantidad afectada' }),
                                  e.jsx('input', {
                                    type: 'number',
                                    value: y.cantidad,
                                    onChange: (r) => v(y._key, 'cantidad', r.target.value),
                                    className: D
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', {
                                    className: H,
                                    children: 'Producto / SKU (opcional)'
                                  }),
                                  e.jsx('input', {
                                    value: y.codigo_producto,
                                    onChange: (r) => v(y._key, 'codigo_producto', r.target.value),
                                    placeholder: 'SKU',
                                    className: D
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', {
                                    className: H,
                                    children: 'Ubicación (opcional)'
                                  }),
                                  e.jsx('input', {
                                    value: y.ubicacion,
                                    onChange: (r) => v(y._key, 'ubicacion', r.target.value),
                                    className: D
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', { className: H, children: 'Lote (opcional)' }),
                                  e.jsx('input', {
                                    value: y.partida,
                                    onChange: (r) => v(y._key, 'partida', r.target.value),
                                    className: D
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'sm:col-span-3',
                                children: [
                                  e.jsx('label', { className: H, children: 'Consecuencia' }),
                                  e.jsx('input', {
                                    value: y.consecuencia,
                                    onChange: (r) => v(y._key, 'consecuencia', r.target.value),
                                    placeholder: 'No apto para despacho hasta evaluación técnica',
                                    className: D
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'sm:col-span-3',
                                children: [
                                  e.jsx('label', { className: H, children: 'Observaciones' }),
                                  e.jsx('input', {
                                    value: y.observaciones,
                                    onChange: (r) => v(y._key, 'observaciones', r.target.value),
                                    className: D
                                  })
                                ]
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'mt-3',
                            children: [
                              e.jsx('label', { className: H, children: 'Evidencia fotográfica' }),
                              e.jsx('div', {
                                className: 'mt-1.5',
                                children: e.jsx(Nt, {
                                  informeId: g,
                                  itemId: y.id,
                                  evidencias: Y(y.id),
                                  onChanged: a
                                })
                              })
                            ]
                          })
                        ]
                      },
                      y._key
                    )
                  )
                })
          ]
        }),
        e.jsxs('div', {
          className: 'bg-white rounded-2xl border border-slate-200 p-5',
          children: [
            e.jsxs('div', {
              className: 'flex items-center justify-between mb-3',
              children: [
                e.jsx('h3', {
                  className: 'text-sm font-black text-slate-700',
                  children: '4. Cuadro resumen de hallazgos'
                }),
                e.jsxs('button', {
                  onClick: L,
                  className:
                    'px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-slate-700',
                  children: [e.jsx(fe, { size: 14 }), ' Fila']
                })
              ]
            }),
            e.jsx('div', {
              className: 'space-y-2',
              children: (S.cuadro_resumen || []).map((y, U) =>
                e.jsxs(
                  'div',
                  {
                    className: 'flex gap-2 items-center',
                    children: [
                      e.jsx('input', {
                        value: y.indicador,
                        onChange: (r) => q(U, 'indicador', r.target.value),
                        placeholder: 'Indicador (ej. Total de bultos recepcionados)',
                        className: `${D} mt-0 flex-1`
                      }),
                      e.jsx('input', {
                        value: y.valor,
                        onChange: (r) => q(U, 'valor', r.target.value),
                        placeholder: 'Valor',
                        className: `${D} mt-0 w-32`
                      }),
                      e.jsx('button', {
                        onClick: () => Q(U),
                        className:
                          'p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50',
                        children: e.jsx(ie, { size: 15 })
                      })
                    ]
                  },
                  U
                )
              )
            })
          ]
        }),
        e.jsxs('div', {
          className: 'bg-white rounded-2xl border border-slate-200 p-5 space-y-4',
          children: [
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: H, children: '5. Análisis y causa probable' }),
                e.jsx('textarea', {
                  rows: 3,
                  value: S.analisis_causa,
                  onChange: (y) => f('analisis_causa', y.target.value),
                  className: D
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsx('label', { className: H, children: '6. Acciones recomendadas' }),
                    e.jsxs('button', {
                      onClick: F,
                      className:
                        'px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-slate-700',
                      children: [e.jsx(fe, { size: 14 }), ' Acción']
                    })
                  ]
                }),
                e.jsx('div', {
                  className: 'space-y-2 mt-1.5',
                  children: (S.acciones_recomendadas || []).map((y, U) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'flex gap-2 items-center',
                        children: [
                          e.jsx('input', {
                            value: y,
                            onChange: (r) => Z(U, r.target.value),
                            placeholder: 'Acción recomendada',
                            className: `${D} mt-0 flex-1`
                          }),
                          e.jsx('button', {
                            onClick: () => O(U),
                            className:
                              'p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50',
                            children: e.jsx(ie, { size: 15 })
                          })
                        ]
                      },
                      U
                    )
                  )
                })
              ]
            })
          ]
        }),
        e.jsxs('div', {
          className:
            'bg-white rounded-2xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4',
          children: [
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: H, children: 'Elaborado por' }),
                e.jsx('input', {
                  value: S.elaborado_por,
                  onChange: (y) => f('elaborado_por', y.target.value),
                  className: D
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: H, children: 'Revisado por' }),
                e.jsx('input', {
                  value: S.revisado_por,
                  onChange: (y) => f('revisado_por', y.target.value),
                  className: D
                })
              ]
            })
          ]
        }),
        e.jsxs('div', {
          className: 'flex justify-end gap-3',
          children: [
            e.jsxs('button', {
              onClick: () => J('BORRADOR'),
              disabled: b.isPending,
              className:
                'px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2',
              children: [
                b.isPending
                  ? e.jsx(ne, { size: 16, className: 'animate-spin' })
                  : e.jsx(ha, { size: 16 }),
                ' ',
                'Guardar'
              ]
            }),
            e.jsxs('button', {
              onClick: () => J('ENVIADO_CALIDAD'),
              disabled: b.isPending,
              className:
                'px-5 py-2.5 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center gap-2 hover:bg-rose-700 disabled:opacity-50',
              children: [e.jsx(Bs, { size: 16 }), ' Guardar y enviar']
            })
          ]
        })
      ]
    });
  },
  It = ({ informe: s, onBack: i, onEdit: d, onDelete: c }) => {
    var N;
    const { hasPermission: C } = ve(),
      b = C('manage_quality'),
      { data: t = [], isLoading: m } = hs(s.id),
      g = Ya(),
      E = Xa(),
      { data: p = [] } = et(),
      { data: A = [] } = st(),
      u = at(),
      [M, w] = _.useState({}),
      l = (a, o) => w((f) => ({ ...f, [a]: { ...f[a], ...o } })),
      S = async (a) => {
        var n;
        const o = M[a.id] || {};
        if (!o.dictamen) {
          R.error('Selecciona un dictamen');
          return;
        }
        const f = Ge.find((v) => v.id === o.dictamen);
        if (f != null && f.mueve && !o.bodegaDestino) {
          R.error('Indica la bodega destino');
          return;
        }
        if (o.tipoAccion) {
          const v = Be.find((h) => h.id === o.tipoAccion);
          if (!(o.area || (v != null && v.area))) {
            R.error('Selecciona el área responsable de la acción');
            return;
          }
        }
        try {
          if (
            (await g.mutateAsync({
              itemId: a.id,
              dictamen: o.dictamen,
              bodegaDestino: o.bodegaDestino,
              acuse: o.acuse
            }),
            R.success(
              `Dictamen registrado: ${f == null ? void 0 : f.label}${f != null && f.mueve ? ' · aviso enviado a Inventario' : ''}`
            ),
            ['CUARENTENA', 'RECHAZAR', 'BAJA'].includes(o.dictamen) &&
              lt({
                codigo: a.codigo_producto,
                ubicacion: a.ubicacion,
                estadoLabel: (f == null ? void 0 : f.label) || o.dictamen,
                tipo: 'CALIDAD_DICTAMEN'
              }),
            o.tipoAccion)
          ) {
            const v = Be.find((L) => L.id === o.tipoAccion),
              h = o.area || (v == null ? void 0 : v.area);
            if (!h) {
              R.error('Selecciona el área responsable de la acción');
              return;
            }
            try {
              const L = await E.mutateAsync({
                itemId: a.id,
                tipoAccion: o.tipoAccion,
                area: h,
                descripcion: o.descAccion,
                prioridad: o.prioridad || 'NORMAL'
              });
              R.success(
                `Acción promulgada ${(L == null ? void 0 : L.folio) || ''} → ${((n = p.find((q) => q.codigo === h)) == null ? void 0 : n.label) || h}`
              );
            } catch (L) {
              R.error(`Dictamen OK, pero no se pudo crear la acción: ${L.message}`);
            }
          }
        } catch (v) {
          R.error(`Error: ${v.message}`);
        }
      },
      $ = () => {
        const a = t.map((h) => ({
            SKU: h.codigo_producto,
            Lote_Serie: h.partida,
            Ubicacion: h.ubicacion,
            Producto: h.producto,
            UM: h.unidad_medida,
            Cantidad: h.cantidad,
            Uds_Afectadas: h.cantidad_afectada || 0,
            No_Registrado: h.no_registrado ? 'SÍ' : '',
            Estado_Inv: h.estado_inventario,
            Tipo: h.tipo,
            Vence: h.fecha_vencimiento,
            Semaforo: h.semaforo,
            Condicion: h.condicion_observada,
            Motivo: h.motivo,
            Observaciones: h.observaciones,
            Dictamen: h.dictamen || '',
            Bodega_Destino: h.bodega_destino || '',
            Acuse: h.acuse_texto || '',
            Calidad: h.calidad_nombre || '',
            Fecha_Dictamen: h.fecha_dictamen || ''
          })),
          o = (h) => t.filter(h).length,
          f = ['LIBERAR', 'CUARENTENA', 'REPROCESO', 'RECHAZAR', 'BAJA'],
          n = [...new Set(t.map((h) => h.condicion_observada).filter(Boolean))],
          v = [
            { Campo: 'Informe', Valor: s.numero },
            { Campo: 'Fecha', Valor: s.fecha },
            { Campo: 'Bodega', Valor: s.bodega || '—' },
            { Campo: 'Analista', Valor: s.analista_nombre || '—' },
            { Campo: 'Estado', Valor: s.estado },
            { Campo: 'Total ítems', Valor: t.length },
            { Campo: 'Dictaminados', Valor: o((h) => h.dictamen) },
            { Campo: 'Pendientes', Valor: o((h) => !h.dictamen) },
            {
              Campo: 'Con problema (cond≠OK)',
              Valor: o((h) => h.condicion_observada && h.condicion_observada !== 'OK')
            },
            { Campo: 'No registrados', Valor: o((h) => h.no_registrado) },
            { Campo: '— Por semáforo —', Valor: '' },
            ...['ROJO', 'NARANJA', 'VERDE', 'NA'].map((h) => ({
              Campo: `Semáforo ${h}`,
              Valor: o((L) => L.semaforo === h)
            })),
            { Campo: '— Por dictamen —', Valor: '' },
            ...f.map((h) => ({ Campo: h, Valor: o((L) => L.dictamen === h) })),
            { Campo: '— Por condición —', Valor: '' },
            ...n.map((h) => ({ Campo: h, Valor: o((L) => L.condicion_observada === h) }))
          ];
        ja({
          filename: `Monitoreo_${s.numero}`,
          sheets: [
            { name: 'Resumen', rows: v },
            { name: 'Detalle', rows: a }
          ]
        });
      },
      T = _.useMemo(() => t.filter((a) => !a.dictamen).length, [t]),
      x = _.useMemo(() => {
        const a = t.length,
          o = t.filter((h) => h.dictamen).length,
          f = t.filter((h) => h.no_registrado).length,
          n = t.filter((h) => h.condicion_observada && h.condicion_observada !== 'OK').length,
          v = { ROJO: 0, NARANJA: 0, VERDE: 0, NA: 0 };
        return (
          t.forEach((h) => {
            v[h.semaforo] = (v[h.semaforo] || 0) + 1;
          }),
          {
            total: a,
            dictaminados: o,
            noReg: f,
            conProblema: n,
            sem: v,
            pct: a ? Math.round((o / a) * 100) : 0
          }
        );
      }, [t]);
    return e.jsxs('div', {
      className: 'space-y-5',
      children: [
        e.jsxs('div', {
          className: 'flex flex-wrap items-center justify-between gap-4',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-4',
              children: [
                e.jsx('button', {
                  onClick: i,
                  className:
                    'p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm',
                  children: e.jsx(Le, { size: 22 })
                }),
                e.jsxs('div', {
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-3',
                      children: [
                        e.jsx('h2', {
                          className: 'text-2xl font-black text-slate-900',
                          children: s.numero
                        }),
                        e.jsx('span', {
                          className: `text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${ra[s.estado] || ''}`,
                          children: (N = s.estado) == null ? void 0 : N.replace('_', ' ')
                        })
                      ]
                    }),
                    e.jsxs('p', {
                      className: 'text-sm text-slate-500 font-medium',
                      children: [
                        s.fecha,
                        ' · ',
                        s.bodega || 'Sin bodega',
                        ' · ',
                        s.analista_nombre || '—',
                        ' ',
                        '· ',
                        T,
                        ' pendientes'
                      ]
                    })
                  ]
                })
              ]
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-2',
              children: [
                d &&
                  e.jsxs('button', {
                    onClick: () => d(s),
                    className:
                      'px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-50',
                    children: [e.jsx(Us, { size: 16 }), ' Editar']
                  }),
                c &&
                  e.jsxs('button', {
                    onClick: () => c(s),
                    className:
                      'px-4 py-2.5 bg-white border border-slate-200 text-rose-600 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-rose-50',
                    children: [e.jsx(ie, { size: 16 }), ' Eliminar']
                  }),
                e.jsxs('button', {
                  onClick: () => gt(s, t),
                  title: 'Descargar Word',
                  className:
                    'px-3 py-2.5 bg-white border border-slate-200 text-blue-700 rounded-xl text-sm font-black flex items-center gap-1.5 hover:bg-blue-50',
                  children: [e.jsx(Oe, { size: 16 }), ' Word']
                }),
                e.jsxs('button', {
                  onClick: () => ft(s, t),
                  title: 'Descargar PDF',
                  className:
                    'px-3 py-2.5 bg-white border border-slate-200 text-rose-700 rounded-xl text-sm font-black flex items-center gap-1.5 hover:bg-rose-50',
                  children: [e.jsx(Gs, { size: 16 }), ' PDF']
                }),
                e.jsxs('button', {
                  onClick: $,
                  className:
                    'px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700',
                  children: [e.jsx(ga, { size: 16 }), ' Excel']
                })
              ]
            })
          ]
        }),
        !m &&
          t.length > 0 &&
          e.jsxs('div', {
            className: 'bg-white rounded-2xl border border-slate-200 p-5',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsx('span', {
                    className: 'text-sm font-black text-slate-700',
                    children: 'Avance del dictamen'
                  }),
                  e.jsxs('span', {
                    className: 'text-xs font-bold text-slate-500 tabular-nums',
                    children: [x.dictaminados, '/', x.total, ' · ', x.pct, '%']
                  })
                ]
              }),
              e.jsx('div', {
                className: 'h-2 bg-slate-100 rounded-full overflow-hidden mb-4',
                children: e.jsx('div', {
                  className: 'h-full bg-emerald-500 transition-all',
                  style: { width: `${x.pct}%` }
                })
              }),
              e.jsx('div', {
                className: 'grid grid-cols-2 sm:grid-cols-5 gap-3',
                children: [
                  { label: 'Ítems', value: x.total, cls: 'text-slate-900' },
                  { label: 'Dictaminados', value: x.dictaminados, cls: 'text-emerald-600' },
                  { label: 'Pendientes', value: T, cls: 'text-amber-600' },
                  { label: 'Con problema', value: x.conProblema, cls: 'text-orange-600' },
                  { label: 'No registrados', value: x.noReg, cls: 'text-rose-600' }
                ].map((a) =>
                  e.jsxs(
                    'div',
                    {
                      className: 'bg-slate-50 rounded-xl px-3 py-2.5',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                          children: a.label
                        }),
                        e.jsx('div', {
                          className: `text-2xl font-black tabular-nums ${a.cls}`,
                          children: a.value
                        })
                      ]
                    },
                    a.label
                  )
                )
              }),
              e.jsxs('div', {
                className: 'flex flex-wrap gap-2 mt-3',
                children: [
                  x.sem.ROJO > 0 &&
                    e.jsxs('span', {
                      className:
                        'text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1',
                      children: [
                        e.jsx('span', { className: 'w-2 h-2 rounded-full bg-rose-500' }),
                        ' ',
                        x.sem.ROJO,
                        ' vence <30d'
                      ]
                    }),
                  x.sem.NARANJA > 0 &&
                    e.jsxs('span', {
                      className:
                        'text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1',
                      children: [
                        e.jsx('span', { className: 'w-2 h-2 rounded-full bg-amber-500' }),
                        ' ',
                        x.sem.NARANJA,
                        ' vence <90d'
                      ]
                    }),
                  x.sem.VERDE > 0 &&
                    e.jsxs('span', {
                      className:
                        'text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1',
                      children: [
                        e.jsx('span', { className: 'w-2 h-2 rounded-full bg-emerald-500' }),
                        ' ',
                        x.sem.VERDE,
                        ' vigente'
                      ]
                    })
                ]
              })
            ]
          }),
        m
          ? e.jsx('div', {
              className: 'flex justify-center py-16',
              children: e.jsx(ne, { className: 'animate-spin text-emerald-500', size: 32 })
            })
          : e.jsx('div', {
              className: 'space-y-3',
              children: t.map((a) => {
                const o = M[a.id] || {},
                  f = Ge.find((n) => n.id === o.dictamen);
                return e.jsxs(
                  'div',
                  {
                    className: 'bg-white rounded-2xl border border-slate-200 p-4',
                    children: [
                      e.jsxs('div', {
                        className: 'flex flex-wrap items-center justify-between gap-3',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-3 min-w-0',
                            children: [
                              e.jsx('span', {
                                className: `w-2.5 h-2.5 rounded-full ${os[a.semaforo] || 'bg-slate-300'}`
                              }),
                              e.jsx('span', {
                                className:
                                  'font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100',
                                children: a.codigo_producto
                              }),
                              a.no_registrado &&
                                e.jsx('span', {
                                  className:
                                    'text-[9px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded uppercase tracking-wide',
                                  children: 'No registrado'
                                }),
                              e.jsx('span', {
                                className: 'text-slate-600 truncate',
                                children: a.producto
                              }),
                              e.jsxs('span', {
                                className: 'text-[10px] text-slate-400',
                                children: [
                                  'lote ',
                                  a.partida || '—',
                                  ' · ',
                                  a.ubicacion || 's/ubic',
                                  ' · ',
                                  a.cantidad,
                                  ' uds'
                                ]
                              })
                            ]
                          }),
                          a.dictamen
                            ? e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  e.jsx(it, { estado: zt(a.dictamen) }),
                                  e.jsxs('span', {
                                    className: 'text-xs font-bold text-slate-500',
                                    children: [
                                      a.dictamen,
                                      a.bodega_destino ? ` → BD ${a.bodega_destino}` : '',
                                      ' ·',
                                      ' ',
                                      a.calidad_nombre
                                    ]
                                  })
                                ]
                              })
                            : e.jsx('span', {
                                className:
                                  'text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200',
                                children: 'Pendiente'
                              })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500',
                        children: [
                          e.jsxs('span', {
                            children: [
                              'Condición:',
                              ' ',
                              e.jsx('b', {
                                className:
                                  a.condicion_observada && a.condicion_observada !== 'OK'
                                    ? 'text-amber-700'
                                    : 'text-slate-700',
                                children: a.condicion_observada || '—'
                              })
                            ]
                          }),
                          Number(a.cantidad_afectada) > 0 &&
                            e.jsxs('span', {
                              children: [
                                'Afectadas: ',
                                e.jsxs('b', {
                                  className: 'text-amber-700',
                                  children: [a.cantidad_afectada, ' uds']
                                })
                              ]
                            }),
                          e.jsxs('span', {
                            children: [
                              'Motivo: ',
                              e.jsx('b', { className: 'text-slate-700', children: a.motivo || '—' })
                            ]
                          }),
                          a.observaciones &&
                            e.jsxs('span', {
                              children: [
                                'Obs: ',
                                e.jsx('b', {
                                  className: 'text-slate-700',
                                  children: a.observaciones
                                })
                              ]
                            })
                        ]
                      }),
                      b &&
                        !a.dictamen &&
                        e.jsxs('div', {
                          className:
                            'mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-end gap-3',
                          children: [
                            e.jsxs('div', {
                              children: [
                                e.jsx('label', {
                                  className:
                                    'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                                  children: 'Dictamen'
                                }),
                                e.jsxs('select', {
                                  value: o.dictamen || '',
                                  onChange: (n) => l(a.id, { dictamen: n.target.value }),
                                  className:
                                    'block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400',
                                  children: [
                                    e.jsx('option', { value: '', children: '— Elegir —' }),
                                    Ge.map((n) =>
                                      e.jsx('option', { value: n.id, children: n.label }, n.id)
                                    )
                                  ]
                                })
                              ]
                            }),
                            (f == null ? void 0 : f.mueve) &&
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', {
                                    className:
                                      'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                                    children: 'Bodega destino (Softland)'
                                  }),
                                  e.jsxs('select', {
                                    value: o.bodegaDestino || '',
                                    onChange: (n) => l(a.id, { bodegaDestino: n.target.value }),
                                    className:
                                      'block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400',
                                    children: [
                                      e.jsx('option', { value: '', children: '— Elegir —' }),
                                      A.map((n) =>
                                        e.jsxs(
                                          'option',
                                          {
                                            value: n.codigo,
                                            children: [
                                              n.codigo,
                                              ' — ',
                                              n.nombre,
                                              ' (',
                                              n.estado === 'TRANSITORIO'
                                                ? 'Transitorio'
                                                : 'Disponible',
                                              ')'
                                            ]
                                          },
                                          n.codigo
                                        )
                                      ),
                                      A.length === 0 &&
                                        tt.map((n) =>
                                          e.jsx('option', { value: n.id, children: n.label }, n.id)
                                        )
                                    ]
                                  })
                                ]
                              }),
                            e.jsxs('div', {
                              className: 'flex-1 min-w-[180px]',
                              children: [
                                e.jsx('label', {
                                  className:
                                    'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                                  children: 'Acuse / nota'
                                }),
                                e.jsx('input', {
                                  value: o.acuse || '',
                                  onChange: (n) => l(a.id, { acuse: n.target.value }),
                                  placeholder: 'Justificación del dictamen',
                                  className:
                                    'block w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400'
                                })
                              ]
                            }),
                            e.jsxs('div', {
                              children: [
                                e.jsx('label', {
                                  className:
                                    'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                                  children: 'Acción recomendada'
                                }),
                                e.jsxs('select', {
                                  value: o.tipoAccion || '',
                                  onChange: (n) => {
                                    const v = Be.find((h) => h.id === n.target.value);
                                    l(a.id, {
                                      tipoAccion: n.target.value,
                                      area: (v == null ? void 0 : v.area) || o.area
                                    });
                                  },
                                  className:
                                    'block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400',
                                  children: [
                                    e.jsx('option', { value: '', children: '— Ninguna —' }),
                                    Be.map((n) =>
                                      e.jsx('option', { value: n.id, children: n.label }, n.id)
                                    )
                                  ]
                                })
                              ]
                            }),
                            o.tipoAccion &&
                              e.jsxs(e.Fragment, {
                                children: [
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx('label', {
                                        className:
                                          'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                                        children: 'Área responsable'
                                      }),
                                      e.jsxs('select', {
                                        value: o.area || '',
                                        onChange: (n) => l(a.id, { area: n.target.value }),
                                        className:
                                          'block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400',
                                        children: [
                                          e.jsx('option', { value: '', children: '— Elegir —' }),
                                          p.map((n) =>
                                            e.jsx(
                                              'option',
                                              { value: n.codigo, children: n.label },
                                              n.codigo
                                            )
                                          )
                                        ]
                                      })
                                    ]
                                  }),
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx('label', {
                                        className:
                                          'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                                        children: 'Prioridad'
                                      }),
                                      e.jsxs('select', {
                                        value: o.prioridad || 'NORMAL',
                                        onChange: (n) => l(a.id, { prioridad: n.target.value }),
                                        className:
                                          'block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400',
                                        children: [
                                          e.jsx('option', { value: 'NORMAL', children: 'Normal' }),
                                          e.jsx('option', { value: 'URGENTE', children: 'Urgente' })
                                        ]
                                      })
                                    ]
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex-1 min-w-[180px]',
                                    children: [
                                      e.jsx('label', {
                                        className:
                                          'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                                        children: 'Instrucción a la acción'
                                      }),
                                      e.jsx('input', {
                                        value: o.descAccion || '',
                                        onChange: (n) => l(a.id, { descAccion: n.target.value }),
                                        placeholder:
                                          'Qué debe hacer el área (o la pregunta a responder)',
                                        className:
                                          'block w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400'
                                      })
                                    ]
                                  })
                                ]
                              }),
                            e.jsxs('button', {
                              onClick: () => S(a),
                              disabled: g.isPending || E.isPending,
                              className:
                                'px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50',
                              children: [e.jsx(We, { size: 16 }), ' Dictaminar']
                            })
                          ]
                        })
                    ]
                  },
                  a.id
                );
              })
            }),
        b &&
          s.estado === 'ENVIADO_CALIDAD' &&
          T === 0 &&
          t.length > 0 &&
          e.jsx('div', {
            className: 'flex justify-end',
            children: e.jsxs('button', {
              onClick: async () => {
                try {
                  (await u.mutateAsync({ informeId: s.id, estado: 'DICTAMINADO' }),
                    R.success('Informe marcado como dictaminado'),
                    i());
                } catch (a) {
                  R.error(a.message);
                }
              },
              className:
                'px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700',
              children: [e.jsx(fa, { size: 16 }), ' Cerrar dictamen del informe']
            })
          })
      ]
    });
  };
function zt(s) {
  const i = Ge.find((d) => d.id === s);
  return (i == null ? void 0 : i.estado) || 'LIBERADO';
}
const qt = () => {
  const { hasPermission: s, user: i } = ve(),
    d = s('manage_monitoreo') || s('manage_quality'),
    C = (i == null ? void 0 : i.rol) === 'ADMIN' || (i == null ? void 0 : i.es_admin_delegado),
    { data: b = [], isLoading: t } = Ua(),
    m = Ba(),
    [g, E] = _.useState('list'),
    [p, A] = _.useState(null),
    [u, M] = _.useState('hito1'),
    [w, l] = _.useState(null),
    [S, $] = _.useState(null),
    [T, x] = _.useState(''),
    N = Ga(),
    a = Va(),
    o = Ha(),
    f = _.useMemo(() => {
      const F = T.trim().toLocaleLowerCase('es-CL');
      return F
        ? b.filter((Z) =>
            [
              Z.numero,
              Z.bodega,
              Z.analista_nombre,
              Z.estado,
              Z.tipo_informe,
              JSON.stringify(Z.reporte || {})
            ].some((O) =>
              String(O || '')
                .toLocaleLowerCase('es-CL')
                .includes(F)
            )
          )
        : b;
    }, [T, b]);
  (As('tms_calidad_tareas', ['calidad_tareas'], { debounceMs: 400 }),
    As('tms_calidad_asignaciones', ['calidad_asignaciones'], { debounceMs: 400 }),
    _.useEffect(() => {
      if (g === 'detail' && p) {
        const F = b.find((Z) => Z.id === p.id);
        F && A(F);
      }
    }, [b]));
  const n = (F) => {
      (A(F), E(F.tipo_informe === 'DANOS' && d ? 'edit-danos' : 'detail'));
    },
    v = (F) => {
      (A(F), E(F.tipo_informe === 'DANOS' ? 'edit-danos' : 'edit'));
    },
    h = async (F) => {
      if (confirm(`¿Eliminar el informe ${F.numero}? Esta acción no se puede deshacer.`))
        try {
          (await m.mutateAsync(F.id),
            R.success('Informe eliminado'),
            (p == null ? void 0 : p.id) === F.id && (A(null), E('list')));
        } catch (Z) {
          R.error(`No se pudo eliminar: ${Z.message}`);
        }
    },
    L = () => {
      (E('list'), A(null), l(null), $(null));
    },
    q = (F) => {
      (A(null),
        l({
          proveedor: F.proveedor,
          oc: F.oc,
          origen: F.origen,
          fecha_recepcion: F.fecha_recepcion,
          recepcion_id: F.recepcion_id,
          tarea_id: F.id
        }),
        M('hito2'),
        E('new-danos'));
    },
    Q = (F) => {
      (A(null), $(F), M('hito2'), E('new'));
    };
  return e.jsxs('div', {
    className: 'h-full bg-slate-50 p-3 sm:p-6 min-h-screen',
    children: [
      e.jsxs('div', {
        className:
          'bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm p-5 sm:p-7 mb-5 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden',
        children: [
          e.jsx('div', {
            className:
              'absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500'
          }),
          e.jsxs('div', {
            className: 'flex items-center gap-4',
            children: [
              e.jsx('div', {
                className:
                  'w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600',
                children: e.jsx(ua, { size: 30, strokeWidth: 2.4 })
              }),
              e.jsxs('div', {
                children: [
                  e.jsxs('h1', {
                    className: 'text-2xl sm:text-3xl font-black text-slate-900 tracking-tight',
                    children: [
                      'Módulo de ',
                      e.jsx('span', { className: 'text-emerald-600', children: 'Calidad' })
                    ]
                  }),
                  e.jsx('p', {
                    className: 'text-slate-500 font-bold text-sm',
                    children: 'Proceso por hitos: Recepción · Estancia · Salida'
                  })
                ]
              })
            ]
          }),
          g === 'list' &&
            u === 'hito2' &&
            d &&
            e.jsxs('div', {
              className: 'flex flex-wrap gap-2',
              children: [
                e.jsxs('button', {
                  onClick: () => {
                    (A(null), E('new'));
                  },
                  className:
                    'px-5 py-3 bg-emerald-600 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700',
                  children: [e.jsx(fe, { size: 20 }), ' Monitoreo']
                }),
                e.jsxs('button', {
                  onClick: () => {
                    (A(null), E('new-danos'));
                  },
                  className:
                    'px-5 py-3 bg-rose-600 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-rose-600/20 hover:bg-rose-700',
                  children: [e.jsx(xe, { size: 20 }), ' Informe de Daños']
                })
              ]
            })
        ]
      }),
      g === 'list' &&
        e.jsx('div', {
          className: 'flex flex-wrap gap-2 mb-5',
          children: [
            { id: 'hito1', n: 1, label: 'Recepción', sub: 'Ingreso a bodega', icon: ba, badge: N },
            {
              id: 'hito2',
              n: 2,
              label: 'Estancia',
              sub: 'Producto en almacenamiento',
              icon: Ms,
              badge: a
            },
            { id: 'hito3', n: 3, label: 'Salida', sub: 'Despacho', icon: Je, badge: o }
          ].map((F) => {
            const Z = F.icon,
              O = u === F.id;
            return e.jsxs(
              'button',
              {
                onClick: () => M(F.id),
                className: `px-4 py-2.5 rounded-xl font-black text-sm border transition-colors flex items-center gap-2.5 ${O ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`,
                children: [
                  e.jsx('span', {
                    className: `w-6 h-6 rounded-lg flex items-center justify-center text-[11px] ${O ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`,
                    children: F.n
                  }),
                  e.jsx(Z, { size: 16, className: 'shrink-0' }),
                  e.jsxs('span', {
                    className: 'flex flex-col items-start leading-tight',
                    children: [
                      e.jsx('span', { children: F.label }),
                      e.jsx('span', {
                        className: `text-[9px] font-bold ${O ? 'text-white/70' : 'text-slate-400'}`,
                        children: F.sub
                      })
                    ]
                  }),
                  F.badge > 0 &&
                    e.jsx('span', {
                      className: `text-[10px] font-black px-2 py-0.5 rounded-full ${O ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700'}`,
                      children: F.badge
                    })
                ]
              },
              F.id
            );
          })
        }),
      g === 'list' && u === 'hito1' && e.jsx(yt, { onGenerarDanos: q }),
      g === 'list' && u === 'hito3' && e.jsx(Ot, {}),
      g === 'new' &&
        e.jsx(Rs, {
          prefillItems: S == null ? void 0 : S.skus,
          asignacionId: S == null ? void 0 : S.id,
          onCancel: L,
          onSaved: L
        }),
      g === 'edit' && p && e.jsx(Rs, { informe: p, onCancel: L, onSaved: L }),
      g === 'new-danos' && e.jsx(zs, { prefill: w, onCancel: L, onSaved: L }),
      g === 'edit-danos' && p && e.jsx(zs, { informe: p, onCancel: L, onSaved: L }),
      g === 'detail' &&
        p &&
        e.jsx(It, { informe: p, onBack: L, onEdit: d ? v : null, onDelete: d ? h : null }),
      g === 'list' &&
        u === 'hito2' &&
        e.jsx(Et, { canAssign: C, canManageQuality: d, onGenerarInforme: Q }),
      g === 'list' &&
        u === 'hito2' &&
        e.jsxs(e.Fragment, {
          children: [
            e.jsxs('div', {
              className:
                'mb-3 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4',
              children: [
                e.jsxs('div', {
                  className: 'flex flex-wrap items-start justify-between gap-2',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('p', {
                          className:
                            'text-[10px] font-black uppercase tracking-[0.16em] text-sky-600',
                          children: 'Hito 2 · Estancia'
                        }),
                        e.jsxs('h3', {
                          className:
                            'mt-0.5 text-base font-black text-slate-800 flex items-center gap-2',
                          children: [
                            e.jsx(Es, { size: 16, className: 'text-emerald-500' }),
                            ' Informes y dictámenes'
                          ]
                        }),
                        e.jsx('p', {
                          className: 'text-xs text-slate-500',
                          children: 'Busca por OC, proveedor, número de informe, bodega o analista.'
                        })
                      ]
                    }),
                    !t &&
                      e.jsxs('span', {
                        className:
                          'rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-slate-500 border border-slate-200',
                        children: [f.length, ' / ', b.length]
                      })
                  ]
                }),
                e.jsxs('label', {
                  className: 'relative mt-3 block',
                  children: [
                    e.jsx(ce, {
                      size: 16,
                      className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                    }),
                    e.jsx('input', {
                      value: T,
                      onChange: (F) => x(F.target.value),
                      placeholder: 'Buscar OC, proveedor, informe, bodega o analista…',
                      className:
                        'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100'
                    })
                  ]
                })
              ]
            }),
            t
              ? e.jsx('div', {
                  className: 'flex justify-center py-20',
                  children: e.jsx(ne, { className: 'animate-spin text-emerald-500', size: 36 })
                })
              : b.length === 0
                ? e.jsxs('div', {
                    className: 'flex flex-col items-center justify-center py-16 text-center',
                    children: [
                      e.jsx(Es, { size: 44, className: 'text-slate-200 mb-4' }),
                      e.jsx('h3', {
                        className: 'text-base font-bold text-slate-400',
                        children: 'Sin informes de monitoreo'
                      }),
                      e.jsx('p', {
                        className: 'text-xs text-slate-300',
                        children: d
                          ? 'Crea el primero con “Monitoreo” o “Informe de Daños”, o desde una asignación de Inventario.'
                          : 'Aún no hay informes generados.'
                      })
                    ]
                  })
                : f.length === 0
                  ? e.jsxs('div', {
                      className:
                        'rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center',
                      children: [
                        e.jsx(ce, { size: 34, className: 'mx-auto mb-3 text-slate-300' }),
                        e.jsx('h3', {
                          className: 'font-bold text-slate-500',
                          children: 'No hay informes que coincidan'
                        }),
                        e.jsx('button', {
                          onClick: () => x(''),
                          className: 'mt-2 text-xs font-black text-sky-600 hover:text-sky-700',
                          children: 'Limpiar búsqueda'
                        })
                      ]
                    })
                  : e.jsx('div', {
                      className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
                      children: f.map((F) => {
                        var O;
                        const Z = F.tipo_informe === 'DANOS';
                        return e.jsxs(
                          'div',
                          {
                            className:
                              'text-left bg-white rounded-2xl border border-slate-200 p-5 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg transition-all',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center justify-between mb-3 gap-2',
                                children: [
                                  e.jsx('button', {
                                    onClick: () => n(F),
                                    className:
                                      'font-black text-slate-900 hover:text-emerald-600 truncate',
                                    children: F.numero
                                  }),
                                  e.jsx('span', {
                                    className: `text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0 ${ra[F.estado] || ''}`,
                                    children: (O = F.estado) == null ? void 0 : O.replace('_', ' ')
                                  })
                                ]
                              }),
                              e.jsxs('button', {
                                onClick: () => n(F),
                                className: 'block w-full text-left',
                                children: [
                                  e.jsx('div', {
                                    className: 'flex items-center gap-2 mb-2',
                                    children: e.jsx('span', {
                                      className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${Ss[F.tipo_informe] || Ss.MONITOREO}`,
                                      children: Z ? 'Daños' : 'Monitoreo'
                                    })
                                  }),
                                  e.jsxs('p', {
                                    className: 'text-sm text-slate-500 font-medium',
                                    children: [F.fecha, ' · ', F.bodega || 'Sin bodega']
                                  }),
                                  e.jsxs('p', {
                                    className: 'text-xs text-slate-400 mt-1',
                                    children: [
                                      F.analista_nombre || '—',
                                      ' · ',
                                      F.total_items,
                                      ' ítems · ',
                                      F.periodicidad
                                    ]
                                  })
                                ]
                              }),
                              d &&
                                e.jsxs('div', {
                                  className:
                                    'flex items-center gap-2 mt-4 pt-3 border-t border-slate-100',
                                  children: [
                                    e.jsxs('button', {
                                      onClick: () => v(F),
                                      className:
                                        'flex-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-black flex items-center justify-center gap-1.5 hover:bg-slate-50',
                                      children: [e.jsx(Us, { size: 14 }), ' Editar']
                                    }),
                                    e.jsxs('button', {
                                      onClick: () => h(F),
                                      className:
                                        'flex-1 px-3 py-2 rounded-lg border border-slate-200 text-rose-600 text-xs font-black flex items-center justify-center gap-1.5 hover:bg-rose-50',
                                      children: [e.jsx(ie, { size: 14 }), ' Eliminar']
                                    })
                                  ]
                                })
                            ]
                          },
                          F.id
                        );
                      })
                    })
          ]
        })
    ]
  });
};
export { qt as default };
