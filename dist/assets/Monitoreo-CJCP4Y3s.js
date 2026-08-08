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
import { j as e, u as ia } from './query-vendor-BNjBrM5A.js';
import { r as f, R as Ts } from './react-vendor-6aw4XXjH.js';
import {
  X as $e,
  R as _e,
  ay as ca,
  c as Se,
  t as S,
  Q as he,
  at as Te,
  b1 as ns,
  a$ as da,
  x as ge,
  a7 as pe,
  b4 as ls,
  g as Re,
  ar as Ie,
  ah as Qe,
  aK as Ls,
  b5 as Ps,
  q as De,
  b6 as He,
  aD as Ke,
  n as xa,
  aI as Cs,
  Y as fe,
  aA as ss,
  b7 as ma,
  b8 as ks,
  a as Le,
  b9 as as,
  aC as ua,
  ac as pa,
  ba as Fs,
  bb as ba,
  h as ha,
  av as is,
  f as Ms,
  aL as ga,
  ai as fa,
  P as Ee,
  bc as Na,
  p as Es,
  aQ as Bs,
  _ as Us,
  bd as Gs,
  an as ja,
  a1 as va,
  a3 as _a
} from './ui-vendor-CTbhg6u_.js';
import { _ as we, u as ye, C as wa } from './index-DC1UTG7q.js';
import { e as ya } from './exportExcel-D85v870c.js';
import { a as cs, s as ds } from './storageUrl-BVww3Jga.js';
import {
  E as Pe,
  d as Ca,
  u as ka,
  s as ke,
  C as xs,
  a as ms,
  r as us,
  i as ps,
  b as bs,
  R as hs,
  c as Ea,
  e as Vs,
  g as ze,
  h as Hs,
  j as Ks,
  k as Aa,
  l as Oa,
  m as Sa,
  n as qs,
  D as Ra,
  o as Ia,
  p as Da,
  q as Js,
  t as za,
  w as As,
  x as $a,
  y as Ta,
  z as La,
  A as Pa,
  B as Fa,
  G as Ws,
  H as Ma,
  I as Ze,
  S as Ue,
  J as Ye,
  K as Ba,
  L as Ua,
  M as Ga,
  N as Va,
  O as Ha,
  P as Ka,
  Q as qa,
  T as Ja,
  U as Wa,
  V as Qa,
  W as Za,
  X as Ya,
  Y as gs,
  Z as Xa,
  _ as et,
  $ as st,
  a0 as Qs,
  a1 as at,
  a2 as tt,
  a3 as ot,
  a4 as rt,
  a5 as nt,
  a6 as lt,
  a7 as Ve,
  a8 as it,
  a9 as Ge,
  aa as Zs,
  ab as ct,
  ac as dt,
  ad as xt,
  ae as mt,
  f as ut
} from './calidadService-CDHQqdvj.js';
import { C as pt } from './CalidadBadge-r9N1P8h0.js';
import { f as bt } from './panelPtm-DM6iM8XS.js';
import { o as ht } from './ingresarService-be4gCB8U.js';
import { u as Os } from './useRealtimeTable-BM5OD2k2.js';
import './supabase-vendor-4Fjsfb0a.js';
import './animation-vendor-JfdD7EdN.js';
import './xlsx-B2eTCt_Q.js';
const Ss = {
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
function fs(s) {
  const d = Ss.codigos[s] || { codigo: 'FO-CAL-000', revision: '01' };
  return { ...Ss, ...d };
}
function gt(s) {
  const d = (s || '').split(',')[1] || '',
    l = atob(d),
    c = new Uint8Array(l.length);
  for (let E = 0; E < l.length; E++) c[E] = l.charCodeAt(E);
  return c;
}
const Ns = [40, 82, 40, 54];
function js(s) {
  const d = fs(s);
  return () => ({
    margin: [40, 16, 40, 0],
    stack: [
      {
        columns: [
          ...(d.logo ? [{ image: d.logo, width: 96, margin: [0, 0, 10, 0] }] : []),
          {
            width: '*',
            stack: [
              { text: d.empresa, bold: !0, fontSize: 13 },
              { text: d.subtitulo, fontSize: 8, color: '#64748b' }
            ]
          },
          {
            width: 'auto',
            table: {
              widths: ['auto', 'auto'],
              body: [
                [
                  { text: 'Código', bold: !0, fontSize: 7 },
                  { text: d.codigo, fontSize: 7 }
                ],
                [
                  { text: 'Revisión', bold: !0, fontSize: 7 },
                  { text: d.revision, fontSize: 7 }
                ],
                [
                  { text: 'Norma', bold: !0, fontSize: 7 },
                  { text: d.norma, fontSize: 7 }
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
function vs(s) {
  const d = fs(s);
  return (l, c) => ({
    margin: [40, 8, 40, 0],
    stack: [
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#cbd5e1' }
        ]
      },
      {
        columns: [
          { text: `${d.codigo} · Rev. ${d.revision} · ${d.norma}`, fontSize: 7, color: '#94a3b8' },
          {
            text: `Documento controlado · Página ${l} de ${c}`,
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
function _s(s, d) {
  const {
      Header: l,
      Footer: c,
      Paragraph: E,
      TextRun: h,
      Table: t,
      TableRow: g,
      TableCell: u,
      WidthType: w,
      AlignmentType: p,
      PageNumber: O,
      BorderStyle: x,
      ImageRun: L
    } = s,
    v = fs(d),
    b = {
      top: { style: x.NONE },
      bottom: { style: x.NONE },
      left: { style: x.NONE },
      right: { style: x.NONE },
      insideHorizontal: { style: x.NONE },
      insideVertical: { style: x.NONE }
    },
    z = new l({
      children: [
        new t({
          width: { size: 100, type: w.PERCENTAGE },
          borders: b,
          rows: [
            new g({
              children: [
                new u({
                  width: { size: 60, type: w.PERCENTAGE },
                  borders: b,
                  children: [
                    ...(v.logo
                      ? [
                          new E({
                            children: [
                              new L({
                                data: gt(v.logo),
                                type: 'png',
                                transformation: {
                                  width: 120,
                                  height: Math.round((120 * v.logo_h) / v.logo_w)
                                }
                              })
                            ]
                          })
                        ]
                      : []),
                    new E({ children: [new h({ text: v.empresa, bold: !0, size: 22 })] }),
                    new E({ children: [new h({ text: v.subtitulo, size: 15, color: '64748B' })] })
                  ]
                }),
                new u({
                  width: { size: 40, type: w.PERCENTAGE },
                  borders: b,
                  children: [
                    new E({
                      alignment: p.RIGHT,
                      children: [
                        new h({ text: `Código: ${v.codigo}  ·  Rev. ${v.revision}`, size: 15 })
                      ]
                    }),
                    new E({
                      alignment: p.RIGHT,
                      children: [
                        new h({
                          text: `${v.norma}  ·  Vig. ${v.fecha_revision}`,
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
    P = new c({
      children: [
        new E({
          alignment: p.CENTER,
          border: { top: { style: x.SINGLE, size: 4, color: 'CBD5E1' } },
          children: [
            new h({
              text: `${v.codigo} · Rev. ${v.revision} · ${v.norma} · Documento controlado · Página `,
              size: 14,
              color: '94A3B8'
            }),
            new h({ children: [O.CURRENT], size: 14, color: '94A3B8' }),
            new h({ text: ' de ', size: 14, color: '94A3B8' }),
            new h({ children: [O.TOTAL_PAGES], size: 14, color: '94A3B8' })
          ]
        })
      ]
    });
  return { header: z, footer: P };
}
const Ys = (s) =>
  s != null && s.storage_path
    ? cs('monitoreo-evidencias', s.storage_path)
    : Promise.resolve((s == null ? void 0 : s.imagen_url) || '');
async function ft(s) {
  const d = await fetch(s);
  if (!d.ok) throw new Error('No se pudo cargar una imagen de evidencia');
  return await d.arrayBuffer();
}
async function Nt(s) {
  const d = await fetch(s);
  if (!d.ok) throw new Error('No se pudo cargar una imagen de evidencia');
  const l = await d.blob();
  return await new Promise((c, E) => {
    const h = new FileReader();
    ((h.onload = () => c(h.result)), (h.onerror = E), h.readAsDataURL(l));
  });
}
function jt(s, d) {
  const l = URL.createObjectURL(s),
    c = document.createElement('a');
  ((c.href = l),
    (c.download = d),
    document.body.appendChild(c),
    c.click(),
    c.remove(),
    setTimeout(() => URL.revokeObjectURL(l), 4e3));
}
function Xs(s, d, l) {
  const c = s.reporte || {},
    E = {};
  return (
    (l || []).forEach((h) => {
      const t = h.item_id || 'general';
      (E[t] = E[t] || []).push(h);
    }),
    { rep: c, evByItem: E }
  );
}
async function vt(s, d = [], l = []) {
  const c = await we(() => import('./index-BmpJy8SR.js'), []),
    {
      Document: E,
      Packer: h,
      Paragraph: t,
      TextRun: g,
      HeadingLevel: u,
      Table: w,
      TableRow: p,
      TableCell: O,
      WidthType: x,
      ImageRun: L,
      AlignmentType: v
    } = c,
    { header: b, footer: z } = _s(c, 'danos'),
    { rep: P, evByItem: M } = Xs(s, d, l),
    R = (N, j) =>
      new p({
        children: [
          new O({
            width: { size: 35, type: x.PERCENTAGE },
            children: [new t({ children: [new g({ text: N, bold: !0 })] })]
          }),
          new O({ width: { size: 65, type: x.PERCENTAGE }, children: [new t(String(j ?? '—'))] })
        ]
      }),
    _ = [];
  (_.push(
    new t({ text: 'INFORME DE DAÑOS / NO CONFORMIDAD', heading: u.TITLE, alignment: v.CENTER })
  ),
    P.tipo_producto && _.push(new t({ text: P.tipo_producto, alignment: v.CENTER })),
    _.push(new t({ text: s.numero || '', alignment: v.CENTER })),
    _.push(new t('')),
    _.push(
      new w({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          R('Fecha de recepción', P.fecha_recepcion || s.fecha),
          R('Tipo de producto', P.tipo_producto),
          R('Área responsable', P.area_responsable),
          R('Clasificación', P.clasificacion),
          R('Bodega', s.bodega),
          R('Analista', s.analista_nombre)
        ]
      })
    ),
    _.push(new t('')));
  const o = (N, j) => {
    (_.push(new t({ text: N, heading: u.HEADING_2 })), j && _.push(new t(String(j))));
  };
  (P.antecedentes && o('1. ANTECEDENTES', P.antecedentes),
    P.descripcion_hallazgo && o('2. DESCRIPCIÓN DEL HALLAZGO', P.descripcion_hallazgo),
    _.push(new t({ text: '3. DAÑOS IDENTIFICADOS', heading: u.HEADING_2 })));
  let a = 0;
  for (const N of d) {
    a += 1;
    const j =
      [N.componente_afectado, N.tipo_dano].filter(Boolean).join(' — ') ||
      N.producto ||
      `Hallazgo ${a}`;
    _.push(new t({ text: `3.${a} ${j}`, heading: u.HEADING_3 }));
    const A = [];
    ((N.producto || N.codigo_producto) &&
      A.push(
        `Producto: ${N.producto || ''} ${N.codigo_producto ? `(${N.codigo_producto})` : ''}`.trim()
      ),
      Number(N.cantidad) > 0 && A.push(`Cantidad: ${Number(N.cantidad)}`),
      N.ubicacion && A.push(`Ubicación: ${N.ubicacion}`),
      N.partida && A.push(`Lote: ${N.partida}`),
      N.tipo_dano && A.push(`Tipo de daño: ${N.tipo_dano}`),
      N.componente_afectado && A.push(`Componente afectado: ${N.componente_afectado}`),
      N.consecuencia && A.push(`Consecuencia: ${N.consecuencia}`),
      N.observaciones && A.push(`Observaciones: ${N.observaciones}`),
      A.forEach((J) => _.push(new t({ children: [new g(J)] }))));
    const Y = M[N.id] || [];
    for (const J of Y)
      try {
        const F = await ft(await Ys(J));
        (_.push(
          new t({
            children: [new L({ data: F, type: 'jpg', transformation: { width: 320, height: 240 } })]
          })
        ),
          J.descripcion &&
            _.push(new t({ children: [new g({ text: J.descripcion, italics: !0, size: 18 })] })));
      } catch {}
    _.push(new t(''));
  }
  (Array.isArray(P.cuadro_resumen) &&
    P.cuadro_resumen.length &&
    (_.push(new t({ text: '4. CUADRO RESUMEN DE HALLAZGOS', heading: u.HEADING_2 })),
    _.push(
      new w({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          new p({
            children: [
              new O({ children: [new t({ children: [new g({ text: 'Indicador', bold: !0 })] })] }),
              new O({ children: [new t({ children: [new g({ text: 'Valor', bold: !0 })] })] })
            ]
          }),
          ...P.cuadro_resumen.map(
            (N) =>
              new p({
                children: [
                  new O({ children: [new t(String(N.indicador ?? ''))] }),
                  new O({ children: [new t(String(N.valor ?? ''))] })
                ]
              })
          )
        ]
      })
    ),
    _.push(new t(''))),
    P.analisis_causa && o('5. ANÁLISIS Y CAUSA PROBABLE', P.analisis_causa),
    Array.isArray(P.acciones_recomendadas) &&
      P.acciones_recomendadas.length &&
      (_.push(new t({ text: '6. ACCIONES RECOMENDADAS', heading: u.HEADING_2 })),
      P.acciones_recomendadas
        .filter(Boolean)
        .forEach((N) => _.push(new t({ text: N, bullet: { level: 0 } }))),
      _.push(new t(''))),
    _.push(new t('')),
    _.push(
      new w({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          new p({
            children: [
              new O({
                children: [
                  new t('_______________________________'),
                  new t({
                    children: [
                      new g({
                        text: P.elaborado_por || s.analista_nombre || 'Nombre / Firma',
                        bold: !0
                      })
                    ]
                  }),
                  new t('Elaborado por — Control de Operaciones')
                ]
              }),
              new O({
                children: [
                  new t('_______________________________'),
                  new t({
                    children: [new g({ text: P.revisado_por || 'Nombre / Firma', bold: !0 })]
                  }),
                  new t('Revisado por — Jefatura / Supervisión')
                ]
              })
            ]
          })
        ]
      })
    ));
  const m = new E({
      sections: [{ headers: { default: b }, footers: { default: z }, children: _ }]
    }),
    n = await h.toBlob(m);
  jt(n, `${s.numero || 'Informe_Danos'}.docx`);
}
async function _t(s, d = [], l = []) {
  var v;
  const c = await we(
      () => import('./pdfmake-pNuCVKVo.js').then((b) => b.p),
      __vite__mapDeps([0, 1])
    ),
    E = await we(() => import('./vfs_fonts-CfcbzCvn.js').then((b) => b.v), __vite__mapDeps([2, 1])),
    h = c.default || c,
    t = E.default || E;
  h.vfs = ((v = t.pdfMake) == null ? void 0 : v.vfs) || t.vfs || h.vfs;
  const { rep: g, evByItem: u } = Xs(s, d, l),
    w = [];
  (w.push({ text: 'INFORME DE DAÑOS / NO CONFORMIDAD', style: 'title' }),
    g.tipo_producto && w.push({ text: g.tipo_producto, alignment: 'center', margin: [0, 0, 0, 2] }),
    w.push({ text: s.numero || '', alignment: 'center', margin: [0, 0, 0, 10], color: '#64748b' }));
  const p = (b, z) => [{ text: b, bold: !0 }, { text: String(z ?? '—') }];
  w.push({
    table: {
      widths: ['35%', '65%'],
      body: [
        p('Fecha de recepción', g.fecha_recepcion || s.fecha),
        p('Tipo de producto', g.tipo_producto),
        p('Área responsable', g.area_responsable),
        p('Clasificación', g.clasificacion),
        p('Bodega', s.bodega),
        p('Analista', s.analista_nombre)
      ]
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 12]
  });
  const O = (b, z) => {
    (w.push({ text: b, style: 'h2' }), z && w.push({ text: String(z), margin: [0, 0, 0, 8] }));
  };
  (g.antecedentes && O('1. ANTECEDENTES', g.antecedentes),
    g.descripcion_hallazgo && O('2. DESCRIPCIÓN DEL HALLAZGO', g.descripcion_hallazgo),
    w.push({ text: '3. DAÑOS IDENTIFICADOS', style: 'h2' }));
  let x = 0;
  for (const b of d) {
    x += 1;
    const z =
      [b.componente_afectado, b.tipo_dano].filter(Boolean).join(' — ') ||
      b.producto ||
      `Hallazgo ${x}`;
    w.push({ text: `3.${x} ${z}`, style: 'h3' });
    const P = [];
    ((b.producto || b.codigo_producto) &&
      P.push(
        `Producto: ${b.producto || ''} ${b.codigo_producto ? `(${b.codigo_producto})` : ''}`.trim()
      ),
      Number(b.cantidad) > 0 && P.push(`Cantidad: ${Number(b.cantidad)}`),
      b.ubicacion && P.push(`Ubicación: ${b.ubicacion}`),
      b.partida && P.push(`Lote: ${b.partida}`),
      b.tipo_dano && P.push(`Tipo de daño: ${b.tipo_dano}`),
      b.componente_afectado && P.push(`Componente afectado: ${b.componente_afectado}`),
      b.consecuencia && P.push(`Consecuencia: ${b.consecuencia}`),
      b.observaciones && P.push(`Observaciones: ${b.observaciones}`),
      P.length && w.push({ ul: P, margin: [0, 0, 0, 6] }));
    const M = u[b.id] || [],
      R = [];
    for (const _ of M)
      try {
        const o = await Nt(await Ys(_));
        R.push({ image: o, width: 220, margin: [0, 4, 8, 4] });
      } catch {}
    R.length && w.push({ columns: R, columnGap: 8, margin: [0, 0, 0, 8] });
  }
  (Array.isArray(g.cuadro_resumen) &&
    g.cuadro_resumen.length &&
    (w.push({ text: '4. CUADRO RESUMEN DE HALLAZGOS', style: 'h2' }),
    w.push({
      table: {
        widths: ['70%', '30%'],
        body: [
          [
            { text: 'Indicador', bold: !0 },
            { text: 'Valor', bold: !0 }
          ],
          ...g.cuadro_resumen.map((b) => [String(b.indicador ?? ''), String(b.valor ?? '')])
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    })),
    g.analisis_causa && O('5. ANÁLISIS Y CAUSA PROBABLE', g.analisis_causa),
    Array.isArray(g.acciones_recomendadas) &&
      g.acciones_recomendadas.length &&
      (w.push({ text: '6. ACCIONES RECOMENDADAS', style: 'h2' }),
      w.push({ ul: g.acciones_recomendadas.filter(Boolean), margin: [0, 0, 0, 12] })),
    w.push({
      columns: [
        {
          stack: [
            { text: '_______________________________', margin: [0, 20, 0, 0] },
            { text: g.elaborado_por || s.analista_nombre || 'Nombre / Firma', bold: !0 },
            { text: 'Elaborado por — Control de Operaciones', fontSize: 9, color: '#64748b' }
          ]
        },
        {
          stack: [
            { text: '_______________________________', margin: [0, 20, 0, 0] },
            { text: g.revisado_por || 'Nombre / Firma', bold: !0 },
            { text: 'Revisado por — Jefatura / Supervisión', fontSize: 9, color: '#64748b' }
          ]
        }
      ],
      columnGap: 24
    }));
  const L = {
    pageMargins: Ns,
    header: js('danos'),
    footer: vs('danos'),
    content: w,
    defaultStyle: { fontSize: 10 },
    styles: {
      title: { fontSize: 16, bold: !0, alignment: 'center', margin: [0, 0, 0, 2] },
      h2: { fontSize: 12, bold: !0, margin: [0, 10, 0, 4] },
      h3: { fontSize: 11, bold: !0, margin: [0, 6, 0, 2] }
    }
  };
  h.createPdf(L).download(`${s.numero || 'Informe_Danos'}.pdf`);
}
function wt(s, d) {
  const l = URL.createObjectURL(s),
    c = document.createElement('a');
  ((c.href = l),
    (c.download = d),
    document.body.appendChild(c),
    c.click(),
    c.remove(),
    setTimeout(() => URL.revokeObjectURL(l), 4e3));
}
const qe = {
  LIBERAR: 'Liberado',
  CUARENTENA: 'Cuarentena',
  REPROCESO: 'Reproceso',
  RECHAZAR: 'Rechazado',
  BAJA: 'Baja'
};
function ea(s) {
  const d = (c) => s.filter(c).length,
    l = [...new Set(s.map((c) => c.condicion_observada).filter(Boolean))];
  return {
    total: s.length,
    dictaminados: d((c) => c.dictamen),
    pendientes: d((c) => !c.dictamen),
    problema: d((c) => c.condicion_observada && c.condicion_observada !== 'OK'),
    noReg: d((c) => c.no_registrado),
    rojo: d((c) => c.semaforo === 'ROJO'),
    naranja: d((c) => c.semaforo === 'NARANJA'),
    verde: d((c) => c.semaforo === 'VERDE'),
    porDictamen: ['LIBERAR', 'CUARENTENA', 'REPROCESO', 'RECHAZAR', 'BAJA']
      .map((c) => ({ d: c, n: d((E) => E.dictamen === c) }))
      .filter((c) => c.n > 0),
    porCondicion: l.map((c) => ({ x: c, n: d((E) => E.condicion_observada === c) }))
  };
}
async function yt(s, d = []) {
  const l = await we(() => import('./index-BmpJy8SR.js'), []),
    {
      Document: c,
      Packer: E,
      Paragraph: h,
      TextRun: t,
      HeadingLevel: g,
      Table: u,
      TableRow: w,
      TableCell: p,
      WidthType: O,
      AlignmentType: x
    } = l,
    { header: L, footer: v } = _s(l, 'monitoreo'),
    b = ea(d),
    z = (a, m) =>
      new w({
        children: [
          new p({
            width: { size: 35, type: O.PERCENTAGE },
            children: [new h({ children: [new t({ text: a, bold: !0 })] })]
          }),
          new p({ width: { size: 65, type: O.PERCENTAGE }, children: [new h(String(m ?? '—'))] })
        ]
      }),
    P = (a) => new p({ children: [new h({ children: [new t({ text: a, bold: !0, size: 18 })] })] }),
    M = (a) =>
      new p({ children: [new h({ children: [new t({ text: String(a ?? '—'), size: 18 })] })] }),
    R = [];
  (R.push(new h({ text: 'INFORME DE MONITOREO A CALIDAD', heading: g.TITLE, alignment: x.CENTER })),
    R.push(new h({ text: s.numero || '', alignment: x.CENTER })),
    R.push(new h('')),
    R.push(
      new u({
        width: { size: 100, type: O.PERCENTAGE },
        rows: [
          z('Fecha', s.fecha),
          z('Bodega', s.bodega),
          z('Analista', s.analista_nombre),
          z('Periodicidad', s.periodicidad),
          z('Estado', (s.estado || '').replace('_', ' '))
        ]
      })
    ),
    R.push(new h('')),
    R.push(new h({ text: '1. RESUMEN EJECUTIVO', heading: g.HEADING_2 })),
    R.push(
      new u({
        width: { size: 100, type: O.PERCENTAGE },
        rows: [
          z('Total de ítems', b.total),
          z('Dictaminados', b.dictaminados),
          z('Pendientes', b.pendientes),
          z('Con problema (condición ≠ OK)', b.problema),
          z('No registrados en sistema', b.noReg),
          z('Semáforo vencimiento (🔴/🟠/🟢)', `${b.rojo} / ${b.naranja} / ${b.verde}`),
          ...b.porDictamen.map((a) => z(`Dictamen · ${qe[a.d] || a.d}`, a.n))
        ]
      })
    ),
    R.push(new h('')),
    R.push(new h({ text: '2. DETALLE DE ÍTEMS', heading: g.HEADING_2 })),
    R.push(
      new u({
        width: { size: 100, type: O.PERCENTAGE },
        rows: [
          new w({
            children: [
              'SKU',
              'Producto',
              'Lote/Serie',
              'Ubic.',
              'Cant',
              'Afect.',
              'Condición',
              'Dictamen'
            ].map(P)
          }),
          ...d.map(
            (a) =>
              new w({
                children: [
                  M(a.codigo_producto),
                  M(a.producto),
                  M(a.partida),
                  M(a.ubicacion),
                  M(a.cantidad),
                  M(a.cantidad_afectada || 0),
                  M((a.no_registrado ? 'NO REG · ' : '') + (a.condicion_observada || '')),
                  M(a.dictamen ? qe[a.dictamen] || a.dictamen : 'Pendiente')
                ]
              })
          )
        ]
      })
    ),
    R.push(new h('')),
    R.push(new h('')),
    R.push(
      new u({
        width: { size: 100, type: O.PERCENTAGE },
        rows: [
          new w({
            children: [
              new p({
                children: [
                  new h('_______________________________'),
                  new h({
                    children: [new t({ text: s.analista_nombre || 'Nombre / Firma', bold: !0 })]
                  }),
                  new h('Analista — Monitoreo')
                ]
              }),
              new p({
                children: [
                  new h('_______________________________'),
                  new h({ children: [new t({ text: 'Nombre / Firma', bold: !0 })] }),
                  new h('Calidad — Dictamen')
                ]
              })
            ]
          })
        ]
      })
    ));
  const _ = new c({
      sections: [{ headers: { default: L }, footers: { default: v }, children: R }]
    }),
    o = await E.toBlob(_);
  wt(o, `${s.numero || 'Informe_Monitoreo'}.docx`);
}
async function Ct(s, d = []) {
  var w;
  const l = await we(
      () => import('./pdfmake-pNuCVKVo.js').then((p) => p.p),
      __vite__mapDeps([0, 1])
    ),
    c = await we(() => import('./vfs_fonts-CfcbzCvn.js').then((p) => p.v), __vite__mapDeps([2, 1])),
    E = l.default || l,
    h = c.default || c;
  E.vfs = ((w = h.pdfMake) == null ? void 0 : w.vfs) || h.vfs || E.vfs;
  const t = ea(d),
    g = (p, O) => [{ text: p, bold: !0 }, { text: String(O ?? '—') }],
    u = [];
  (u.push({ text: 'INFORME DE MONITOREO A CALIDAD', style: 'title' }),
    u.push({ text: s.numero || '', alignment: 'center', margin: [0, 0, 0, 10], color: '#64748b' }),
    u.push({
      table: {
        widths: ['35%', '65%'],
        body: [
          g('Fecha', s.fecha),
          g('Bodega', s.bodega),
          g('Analista', s.analista_nombre),
          g('Periodicidad', s.periodicidad),
          g('Estado', (s.estado || '').replace('_', ' '))
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    }),
    u.push({ text: '1. Resumen ejecutivo', style: 'h2' }),
    u.push({
      table: {
        widths: ['60%', '40%'],
        body: [
          g('Total de ítems', t.total),
          g('Dictaminados', t.dictaminados),
          g('Pendientes', t.pendientes),
          g('Con problema (condición ≠ OK)', t.problema),
          g('No registrados en sistema', t.noReg),
          g('Semáforo vencimiento (R/N/V)', `${t.rojo} / ${t.naranja} / ${t.verde}`),
          ...t.porDictamen.map((p) => g(`Dictamen · ${qe[p.d] || p.d}`, p.n))
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    }),
    u.push({ text: '2. Detalle de ítems', style: 'h2' }),
    u.push({
      table: {
        headerRows: 1,
        widths: ['auto', '*', 'auto', 'auto', 22, 22, 'auto', 'auto'],
        body: [
          ['SKU', 'Producto', 'Lote/Serie', 'Ubic.', 'Cant', 'Afe.', 'Condición', 'Dictamen'].map(
            (p) => ({ text: p, bold: !0, fontSize: 8 })
          ),
          ...d.map((p) => [
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
            { text: p.dictamen ? qe[p.dictamen] || p.dictamen : 'Pendiente', fontSize: 8 }
          ])
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 16]
    }),
    u.push({
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
    E.createPdf({
      pageMargins: Ns,
      header: js('monitoreo'),
      footer: vs('monitoreo'),
      content: u,
      defaultStyle: { fontSize: 10 },
      styles: {
        title: { fontSize: 16, bold: !0, alignment: 'center', margin: [0, 0, 0, 2] },
        h2: { fontSize: 12, bold: !0, margin: [0, 10, 0, 4] }
      }
    }).download(`${s.numero || 'Informe_Monitoreo'}.pdf`));
}
async function ws(s) {
  try {
    const d = await createImageBitmap(s),
      l = 1600;
    let { width: c, height: E } = d;
    if (c > l || E > l) {
      const u = Math.min(l / c, l / E);
      ((c = Math.round(c * u)), (E = Math.round(E * u)));
    }
    const h = document.createElement('canvas');
    return (
      (h.width = c),
      (h.height = E),
      h.getContext('2d').drawImage(d, 0, 0, c, E),
      (await new Promise((u) => h.toBlob(u, 'image/jpeg', 0.82))) || s
    );
  } catch {
    return s;
  }
}
const ys = ({ onCapture: s, onClose: d }) => {
    const l = f.useRef(null),
      c = f.useRef(null),
      [E, h] = f.useState('environment'),
      [t, g] = f.useState(null),
      [u, w] = f.useState(null),
      [p, O] = f.useState(null),
      [x, L] = f.useState(!0),
      v = f.useCallback(() => {
        var o;
        try {
          (o = c.current) == null || o.getTracks().forEach((a) => a.stop());
        } catch {}
        c.current = null;
      }, []),
      b = f.useCallback(
        async (o) => {
          var a;
          (v(), L(!0), O(null));
          try {
            if (!((a = navigator.mediaDevices) != null && a.getUserMedia))
              throw new Error('sin getUserMedia');
            const m = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: { ideal: o }, width: { ideal: 1920 }, height: { ideal: 1080 } },
              audio: !1
            });
            ((c.current = m),
              l.current && ((l.current.srcObject = m), await l.current.play().catch(() => {})));
          } catch {
            O(
              'No se pudo abrir la cámara. Revisa el permiso de cámara de la app y vuelve a intentar (o usa "Galería").'
            );
          } finally {
            L(!1);
          }
        },
        [v]
      );
    f.useEffect(() => (b(E), v), []);
    const z = () => {
        const o = E === 'environment' ? 'user' : 'environment';
        (h(o), b(o));
      },
      P = () => {
        const o = l.current;
        if (!o || !o.videoWidth) return S.error('La cámara aún no está lista');
        const a = document.createElement('canvas');
        ((a.width = o.videoWidth),
          (a.height = o.videoHeight),
          a.getContext('2d').drawImage(o, 0, 0, a.width, a.height),
          a.toBlob(
            (m) => {
              if (!m) return S.error('No se pudo capturar la foto');
              (w(m), g(URL.createObjectURL(m)), v());
            },
            'image/jpeg',
            0.9
          ));
      },
      M = () => {
        (t && URL.revokeObjectURL(t), g(null), w(null), b(E));
      },
      R = () => {
        if (!u) return;
        const o = new File([u], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
        (t && URL.revokeObjectURL(t), s == null || s(o), d == null || d());
      },
      _ = () => {
        (v(), t && URL.revokeObjectURL(t), d == null || d());
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
              onClick: _,
              className: 'p-2 -m-2',
              'aria-label': 'Cerrar',
              children: e.jsx($e, { size: 26 })
            }),
            e.jsx('span', { className: 'text-sm font-black tracking-wide', children: 'CÁMARA' }),
            e.jsx('button', {
              onClick: z,
              className: 'p-2 -m-2 disabled:opacity-30',
              disabled: !!t || !!p,
              'aria-label': 'Cambiar cámara',
              children: e.jsx(_e, { size: 22 })
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
                    ref: l,
                    autoPlay: !0,
                    playsInline: !0,
                    muted: !0,
                    className: 'w-full h-full object-cover'
                  }),
            x &&
              !t &&
              !p &&
              e.jsx('div', {
                className: 'absolute inset-0 flex items-center justify-center text-white/70',
                children: e.jsx(_e, { className: 'animate-spin', size: 30 })
              })
          ]
        }),
        e.jsx('div', {
          className: 'px-6 py-7 flex items-center justify-center gap-10 shrink-0',
          children: t
            ? e.jsxs(e.Fragment, {
                children: [
                  e.jsxs('button', {
                    onClick: M,
                    className: 'flex flex-col items-center gap-1 text-white active:scale-95',
                    children: [
                      e.jsx(ca, { size: 28 }),
                      e.jsx('span', { className: 'text-[11px] font-bold', children: 'Repetir' })
                    ]
                  }),
                  e.jsx('button', {
                    onClick: R,
                    className:
                      'w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg active:scale-95',
                    'aria-label': 'Usar foto',
                    children: e.jsx(Se, { size: 32 })
                  })
                ]
              })
            : e.jsx('button', {
                onClick: P,
                disabled: x || !!p,
                className:
                  'w-[76px] h-[76px] rounded-full border-[5px] border-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform',
                'aria-label': 'Tomar foto',
                children: e.jsx('span', { className: 'w-14 h-14 rounded-full bg-white' })
              })
        })
      ]
    });
  },
  kt = ({
    informeId: s,
    itemId: d,
    evidencias: l = [],
    onChanged: c,
    canManage: E = !0,
    compact: h = !1
  }) => {
    const { user: t } = ye(),
      g = f.useRef(null),
      [u, w] = f.useState(!1),
      [p, O] = f.useState(!1),
      x = wa.isNativePlatform() || (typeof navigator < 'u' && navigator.maxTouchPoints > 0),
      [L, v] = f.useState(null),
      [b, z] = f.useState({});
    f.useEffect(() => {
      let o = !0;
      return (
        ds(
          Pe,
          l.map((a) => a.storage_path)
        ).then((a) => {
          o && z(a);
        }),
        () => {
          o = !1;
        }
      );
    }, [l]);
    const P = E && !!s && !!d,
      M = async (o) => {
        var m;
        const a = Array.from(o.target.files || []);
        if (((o.target.value = ''), !(!a.length || !s))) {
          O(!0);
          try {
            for (const n of a) {
              if (!n.type.startsWith('image/')) continue;
              const N = await ws(n);
              await ka({ informeId: s, itemId: d, blob: N, user: t });
            }
            (S.success(a.length > 1 ? 'Fotos agregadas' : 'Foto agregada'), c == null || c());
          } catch (n) {
            S.error(
              (m = n == null ? void 0 : n.message) != null && m.includes('row-level security')
                ? 'No tienes permiso para subir fotos'
                : `Error al subir: ${n.message}`
            );
          } finally {
            O(!1);
          }
        }
      },
      R = async (o) => {
        if (confirm('¿Eliminar esta foto?'))
          try {
            (await Ca(o), S.success('Foto eliminada'), c == null || c());
          } catch {
            S.error('No se pudo eliminar la foto');
          }
      },
      _ = h ? 'w-16 h-16' : 'w-20 h-20';
    return e.jsxs('div', {
      children: [
        e.jsxs('div', {
          className: 'flex items-center gap-2 flex-wrap',
          children: [
            l.map((o) =>
              e.jsxs(
                'div',
                {
                  className: `relative group ${_} rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0`,
                  children: [
                    e.jsx('img', {
                      src: b[o.storage_path] || '',
                      alt: o.descripcion || '',
                      className: 'w-full h-full object-cover cursor-zoom-in',
                      onClick: () => b[o.storage_path] && v(b[o.storage_path])
                    }),
                    E &&
                      e.jsx('button', {
                        onClick: () => R(o),
                        title: 'Eliminar foto',
                        className:
                          'absolute top-0.5 right-0.5 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity active:scale-90',
                        children: e.jsx(he, { size: 12 })
                      })
                  ]
                },
                o.id
              )
            ),
            E &&
              x &&
              e.jsxs('button', {
                type: 'button',
                onClick: () => w(!0),
                disabled: !P || p,
                title: d ? 'Tomar foto con la cámara' : 'Guarda el borrador para adjuntar fotos',
                className: `${_} shrink-0 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-500 flex flex-col items-center justify-center gap-1 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed`,
                children: [
                  p ? e.jsx(_e, { size: 18, className: 'animate-spin' }) : e.jsx(Te, { size: 18 }),
                  e.jsx('span', {
                    className: 'text-[8px] font-black uppercase tracking-wider',
                    children: 'Cámara'
                  })
                ]
              }),
            E &&
              e.jsxs('button', {
                type: 'button',
                onClick: () => {
                  var o;
                  return (o = g.current) == null ? void 0 : o.click();
                },
                disabled: !P || p,
                title: d
                  ? 'Subir foto desde archivos/galería'
                  : 'Guarda el borrador para adjuntar fotos',
                className: `${_} shrink-0 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-1 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed`,
                children: [
                  p ? e.jsx(_e, { size: 18, className: 'animate-spin' }) : e.jsx(ns, { size: 18 }),
                  e.jsx('span', {
                    className: 'text-[8px] font-black uppercase tracking-wider',
                    children: x ? 'Galería' : 'Foto'
                  })
                ]
              }),
            l.length === 0 &&
              !E &&
              e.jsxs('span', {
                className: 'text-xs text-slate-400 flex items-center gap-1',
                children: [e.jsx(da, { size: 14 }), ' Sin fotos']
              })
          ]
        }),
        E &&
          !d &&
          e.jsx('p', {
            className: 'text-[10px] text-amber-600 mt-1',
            children: 'Guarda el borrador para poder adjuntar fotos a este hallazgo.'
          }),
        e.jsx('input', {
          ref: g,
          type: 'file',
          accept: 'image/*',
          multiple: !0,
          onChange: M,
          className: 'hidden'
        }),
        u &&
          e.jsx(ys, {
            onCapture: (o) => M({ target: { files: [o], value: '' } }),
            onClose: () => w(!1)
          }),
        L &&
          e.jsxs('div', {
            className: 'fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4',
            onClick: () => v(null),
            children: [
              e.jsx('button', {
                className: 'absolute top-4 right-4 text-white/80 hover:text-white p-2',
                children: e.jsx($e, { size: 28 })
              }),
              e.jsx('img', {
                src: L,
                alt: '',
                className: 'max-w-full max-h-full object-contain rounded-xl'
              })
            ]
          })
      ]
    });
  },
  Oe = (s) => (s.checklist && s.checklist._extras) || {},
  Je = {
    PALLET: 'Foto del pallet',
    EMBALAJE: 'Foto del embalaje',
    CAMION: 'Foto dentro del camión',
    PRODUCTO: 'Foto del producto',
    DOCUMENTO: 'Documentación',
    GENERAL: 'Foto general'
  };
function Et(s, d) {
  const l = URL.createObjectURL(s),
    c = document.createElement('a');
  ((c.href = l),
    (c.download = d),
    document.body.appendChild(c),
    c.click(),
    c.remove(),
    setTimeout(() => URL.revokeObjectURL(l), 4e3));
}
const sa = { OK: 'Conforme', NO: 'No conforme', NA: 'N/A' },
  At = { IMPORTACION: 'Importación', NACIONAL: 'Nacional' };
function Fe(s, d = {}) {
  return d.tipo === 'SALIDA' || s.tipo === 'CERTIFICADO_SALIDA';
}
function aa(s, d = {}) {
  if (Fe(s, d))
    return s.resultado === 'CONFORME'
      ? 'CERTIFICADO DE CONFORMIDAD DE SALIDA'
      : s.resultado === 'NO_CONFORME'
        ? 'ACTA — CERTIFICACIÓN DE SALIDA (NO CONFORME)'
        : 'CERTIFICACIÓN DE SALIDA';
  const l = d.soloNoSanitario ? ' (PRODUCTO NO SANITARIO)' : '';
  return s.resultado === 'CONFORME'
    ? `CERTIFICADO DE CONFORMIDAD${l}`
    : s.resultado === 'NO_CONFORME'
      ? 'ACTA — CHECKLIST DE INGRESO (NO CONFORME)'
      : 'ACTA — CHECKLIST DE INGRESO';
}
function ta(s, d = {}) {
  const l = s.contexto || {};
  return Fe(s, d)
    ? [
        ['Cliente', s.proveedor],
        ['Nota de Venta', s.oc],
        ['Guía de despacho', l.guia],
        ['Factura', l.factura],
        ['Transportista', l.transportista || l.empresa_transporte],
        ['Fecha de despacho', s.fecha_recepcion],
        ['Bultos', s.bultos]
      ]
    : [
        ['Proveedor', s.proveedor],
        ['Orden de compra', s.oc],
        ['Origen', At[s.origen] || s.origen],
        ['Fecha de recepción', s.fecha_recepcion],
        ['Bultos', s.bultos]
      ];
}
const ts = (s, d) => (Fe(s, d) ? 'salida' : 'checklist');
function We(s = {}) {
  const d = s.categorias || [];
  return d.length
    ? d
        .map((l) => `${l.label}${l.clase_riesgo ? ` (Clase ${l.clase_riesgo})` : ''} × ${l.items}`)
        .join('; ')
    : '';
}
function oa(s, d) {
  const l = s.folio || `CheckList_${s.oc || 'ingreso'}`;
  return `${String(l).replace(/[^\w.-]+/g, '_')}.${d}`;
}
async function ra(s, d = [], l = {}) {
  var J, F, W, Z, ne, xe, oe;
  const c = await we(() => import('./index-BmpJy8SR.js'), []),
    {
      Document: E,
      Packer: h,
      Paragraph: t,
      TextRun: g,
      HeadingLevel: u,
      Table: w,
      TableRow: p,
      TableCell: O,
      WidthType: x,
      AlignmentType: L,
      ShadingType: v,
      BorderStyle: b
    } = c,
    { header: z, footer: P } = _s(c, ts(s, l)),
    M = Fe(s, l),
    R = s.resultado === 'CONFORME',
    _ = {
      top: { style: b.NONE },
      bottom: { style: b.NONE },
      left: { style: b.NONE },
      right: { style: b.NONE },
      insideHorizontal: { style: b.NONE },
      insideVertical: { style: b.NONE }
    },
    o = (D, V) =>
      new p({
        children: [
          new O({
            width: { size: 35, type: x.PERCENTAGE },
            children: [new t({ children: [new g({ text: D, bold: !0 })] })]
          }),
          new O({ width: { size: 65, type: x.PERCENTAGE }, children: [new t(String(V ?? '—'))] })
        ]
      }),
    a = (D) => new O({ children: [new t({ children: [new g({ text: D, bold: !0, size: 18 })] })] }),
    m = (D) =>
      new O({ children: [new t({ children: [new g({ text: String(D ?? '—'), size: 18 })] })] }),
    n = [];
  (n.push(new t({ text: aa(s, l), heading: u.TITLE, alignment: L.CENTER })),
    l.soloNoSanitario &&
      n.push(
        new t({
          alignment: L.CENTER,
          children: [
            new g({
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
      new w({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          new p({
            children: [
              new O({
                shading: { fill: R ? 'ECFDF5' : 'FEF2F2', type: v.CLEAR, color: 'auto' },
                children: [
                  new t({
                    children: [
                      new g({
                        text: R
                          ? M
                            ? 'CERTIFICADO DE CONFORMIDAD DE SALIDA — CONFORME'
                            : 'CERTIFICADO DE CONFORMIDAD — CONFORME'
                          : M
                            ? 'SALIDA NO CONFORME — NO DESPACHAR'
                            : 'RECEPCIÓN NO CONFORME',
                        bold: !0,
                        color: R ? '047857' : 'BE123C'
                      })
                    ]
                  }),
                  new t({
                    children: [new g({ text: `Folio: ${s.folio || '—'}`, bold: !0, size: 26 })]
                  }),
                  new t({
                    children: [
                      new g({
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
      new w({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          ...ta(s, l).map(([D, V]) => o(D, V)),
          o(
            'Resultado',
            R ? 'CONFORME' : s.resultado === 'NO_CONFORME' ? 'NO CONFORME' : s.estado || '—'
          ),
          ...(M ? [o('Estado de despacho', `${ke(s).emoji} ${ke(s).label}`)] : []),
          ...(We(l) ? [o('Familias de producto', We(l))] : []),
          ...(s.disposicion ? [o('Disposición / Acción a tomar', s.disposicion)] : []),
          o('Responsable de Calidad', s.realizado_nombre),
          o(
            'Fecha de finalización',
            s.completado_en ? new Date(s.completado_en).toLocaleString('es-CL') : '—'
          )
        ]
      })
    ),
    n.push(new t('')));
  const N = M && Array.isArray((J = s.contexto) == null ? void 0 : J.skus) ? s.contexto.skus : [];
  N.length &&
    (n.push(new t({ text: 'SKUs del despacho', heading: u.HEADING_2 })),
    n.push(
      new w({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          new p({ children: ['Código', 'Producto', 'Ubicación', 'Cantidad'].map(a) }),
          ...N.map(
            (D) =>
              new p({
                children: [
                  m(D.codigo_producto),
                  m(D.producto),
                  m(D.ubicacion),
                  m(`${D.cantidad ?? '—'} ${D.unidad_medida || ''}`.trim())
                ]
              })
          )
        ]
      })
    ),
    n.push(new t('')));
  const j = s.checklist || {};
  if (
    (d.forEach((D) => {
      (n.push(new t({ text: D.titulo, heading: u.HEADING_2 })),
        n.push(
          new w({
            width: { size: 100, type: x.PERCENTAGE },
            rows: [
              new p({ children: ['Requisito', 'Resultado', 'Evidencia', 'Observación'].map(a) }),
              ...D.params.map((V) => {
                var se, X, y;
                return new p({
                  children: [
                    m(V.label),
                    m(sa[(se = j[V.id]) == null ? void 0 : se.estado] || '—'),
                    m(((X = j[V.id]) == null ? void 0 : X.evidencia) || '—'),
                    m(((y = j[V.id]) == null ? void 0 : y.nota) || '')
                  ]
                });
              })
            ]
          })
        ),
        n.push(new t('')));
    }),
    !M)
  ) {
    const D = Oe(s);
    (Array.isArray(D.clasificacion) &&
      D.clasificacion.length &&
      (n.push(new t({ text: 'Clasificación del producto', heading: u.HEADING_2 })),
      xs.forEach((X) => {
        n.push(new t(`${D.clasificacion.includes(X.id) ? '☑' : '☐'} ${X.label}`));
      }),
      n.push(new t(''))),
      D.embalaje &&
        Object.values(D.embalaje).some(Boolean) &&
        (n.push(new t({ text: 'Evaluación del embalaje', heading: u.HEADING_2 })),
        n.push(
          new w({
            width: { size: 100, type: x.PERCENTAGE },
            rows: ms.map((X) => o(X.label, D.embalaje[X.id] || '—'))
          })
        ),
        n.push(new t(''))));
    const V = us(s.checklist);
    (n.push(
      new w({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          ...(D.disposicionInmediata ? [o('Disposición inmediata', D.disposicionInmediata)] : []),
          o('Riesgo de la recepción', `${V.emoji} ${V.label}`)
        ]
      })
    ),
      n.push(new t('')));
    const se = ps(s);
    (n.push(new t({ text: 'Indicadores ISO', heading: u.HEADING_2 })),
      n.push(
        new w({
          width: { size: 100, type: x.PERCENTAGE },
          rows: [
            o('Tiempo recepción', se.minutos != null ? `${se.minutos} minutos` : '—'),
            o('Inspector', se.inspector || '—'),
            o('N° ítems', se.items),
            o('Conformes', se.ok),
            o('No conformes', se.no),
            o('Resultado', se.pct != null ? `${String(se.pct).replace('.', ',')}%` : '—')
          ]
        })
      ),
      n.push(new t('')));
  }
  if (M) {
    const D = Oe(s),
      V = bs(
        (F = D.pesos) == null ? void 0 : F.esperado,
        (W = D.pesos) == null ? void 0 : W.registrado
      );
    (((Z = D.pesos) != null && Z.esperado) || ((ne = D.pesos) != null && ne.registrado)) &&
      (n.push(new t({ text: 'Control de peso', heading: u.HEADING_2 })),
      n.push(
        new w({
          width: { size: 100, type: x.PERCENTAGE },
          rows: [
            o(
              'Peso esperado',
              (xe = D.pesos) != null && xe.esperado ? `${D.pesos.esperado} kg` : '—'
            ),
            o(
              'Peso registrado',
              (oe = D.pesos) != null && oe.registrado ? `${D.pesos.registrado} kg` : '—'
            ),
            o('Resultado', V || '—')
          ]
        })
      ),
      n.push(new t('')));
    const se = Number(D.bultosTotal ?? s.bultos) || 0;
    if (se > 0) {
      const X = Array.isArray(D.bultosEtiquetas) ? D.bultosEtiquetas : [];
      (n.push(new t({ text: 'Verificación de bultos', heading: u.HEADING_2 })),
        n.push(
          new w({
            width: { size: 100, type: x.PERCENTAGE },
            rows: [
              new p({ children: ['Bulto', 'Etiqueta'].map(a) }),
              ...Array.from(
                { length: Math.min(se, 60) },
                (y, G) =>
                  new p({
                    children: [m(`Bulto ${G + 1}/${se}`), m(X[G] ? 'Etiqueta OK' : 'Pendiente')]
                  })
              )
            ]
          })
        ),
        n.push(new t('')));
    }
    (Array.isArray(D.riesgos) &&
      D.riesgos.length &&
      (n.push(new t({ text: 'Riesgos evaluados', heading: u.HEADING_2 })),
      hs.forEach((X) => {
        n.push(new t(`${D.riesgos.includes(X.id) ? '☑' : '☐'} ${X.label}`));
      }),
      n.push(new t(''))),
      Array.isArray(D.evidencias) &&
        D.evidencias.length &&
        (n.push(new t({ text: 'Evidencia fotográfica', heading: u.HEADING_2 })),
        ['PALLET', 'EMBALAJE', 'CAMION'].forEach((X) => {
          const y = D.evidencias.filter((G) => G.tipo === X).length;
          y && n.push(new t(`📷 ${Je[X]}: ${y} foto(s) asociada(s) al certificado.`));
        }),
        n.push(
          new t({
            children: [
              new g({
                text: 'Las imágenes quedan almacenadas junto al certificado en el sistema CCO (se incluyen en la versión PDF).',
                size: 16,
                color: '64748B'
              })
            ]
          })
        ),
        n.push(new t(''))));
  }
  if (!M) {
    const D = Oe(s);
    Array.isArray(D.evidencias) &&
      D.evidencias.length &&
      (n.push(new t({ text: 'Evidencia fotográfica', heading: u.HEADING_2 })),
      [...new Set(D.evidencias.map((V) => V.tipo))].forEach((V) => {
        const se = D.evidencias.filter((X) => X.tipo === V).length;
        se && n.push(new t(`📷 ${Je[V] || V}: ${se} foto(s) asociada(s) al checklist.`));
      }),
      n.push(
        new t({
          children: [
            new g({
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
    (n.push(new t({ text: 'Observaciones', heading: u.HEADING_2 })),
    n.push(new t(s.observaciones)),
    n.push(new t(''))),
    n.push(new t('')),
    n.push(
      new w({
        width: { size: 100, type: x.PERCENTAGE },
        borders: _,
        rows: [
          new p({
            children: [
              new O({
                borders: _,
                children: [
                  new t('_______________________________'),
                  new t({
                    children: [new g({ text: s.realizado_nombre || 'Nombre / Firma', bold: !0 })]
                  }),
                  new t(M ? 'Calidad — Certificación de salida' : 'Calidad — Inspección de ingreso')
                ]
              }),
              new O({
                borders: _,
                children: [
                  new t('_______________________________'),
                  new t({ children: [new g({ text: 'Nombre / Firma', bold: !0 })] }),
                  new t(M ? 'Despacho / Bodega' : 'Recepción / Bodega')
                ]
              })
            ]
          })
        ]
      })
    ),
    s.firma_digital &&
      (n.push(new t('')),
      n.push(new t({ children: [new g({ text: 'FIRMA ELECTRÓNICA', bold: !0 })] })),
      n.push(
        new t({
          children: [
            new g({
              text: `Algoritmo: ${s.firma_algoritmo || 'HMAC-SHA256'} · Firmado por: ${s.firmado_nombre || '—'} · ${s.firmado_en ? new Date(s.firmado_en).toLocaleString('es-CL') : ''}`,
              size: 16,
              color: '475569'
            })
          ]
        })
      ),
      n.push(new t({ children: [new g({ text: s.firma_digital, size: 12, color: '94A3B8' })] })),
      n.push(
        new t({
          children: [
            new g({
              text: `Verificar en: ${window.location.origin}/verificar?folio=${s.folio || ''}`,
              size: 14,
              color: '475569'
            })
          ]
        })
      )));
  const A = new E({
      sections: [{ headers: { default: z }, footers: { default: P }, children: n }]
    }),
    Y = await h.toBlob(A);
  Et(Y, oa(s, 'docx'));
}
async function na(s, d = [], l = {}) {
  var v, b, z, P, M, R, _, o;
  const c = await we(
      () => import('./pdfmake-pNuCVKVo.js').then((a) => a.p),
      __vite__mapDeps([0, 1])
    ),
    E = await we(() => import('./vfs_fonts-CfcbzCvn.js').then((a) => a.v), __vite__mapDeps([2, 1])),
    h = c.default || c,
    t = E.default || E;
  h.vfs = ((v = t.pdfMake) == null ? void 0 : v.vfs) || t.vfs || h.vfs;
  const g = s.checklist || {},
    u = Fe(s, l),
    w = s.resultado === 'CONFORME',
    p = s.completado_en ? new Date(s.completado_en).toLocaleString('es-CL') : '—',
    O = (a, m) => [{ text: a, bold: !0 }, { text: String(m ?? '—') }],
    x = [];
  (x.push({
    text: aa(s, l),
    style: 'title',
    color: w ? '#047857' : s.resultado === 'NO_CONFORME' ? '#be123c' : '#0f172a'
  }),
    l.soloNoSanitario &&
      x.push({
        text: 'Documento de conformidad de recepción — no constituye certificación de dispositivo médico bajo ISO 13485.',
        italics: !0,
        fontSize: 8,
        color: '#64748b',
        alignment: 'center',
        margin: [0, 0, 0, 4]
      }),
    x.push({
      table: {
        widths: ['*'],
        body: [
          [
            {
              fillColor: w ? '#ecfdf5' : '#fef2f2',
              margin: [10, 8, 10, 8],
              stack: [
                {
                  text: w
                    ? u
                      ? 'CERTIFICADO DE CONFORMIDAD DE SALIDA — CONFORME'
                      : 'CERTIFICADO DE CONFORMIDAD — CONFORME'
                    : u
                      ? 'SALIDA NO CONFORME — NO DESPACHAR'
                      : 'RECEPCIÓN NO CONFORME',
                  bold: !0,
                  fontSize: 11,
                  color: w ? '#047857' : '#be123c'
                },
                ...(u
                  ? [
                      {
                        text: `● ${ke(s).label}`,
                        bold: !0,
                        fontSize: 12,
                        color: ke(s).color,
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
        hLineColor: () => (w ? '#a7f3d0' : '#fecaca'),
        vLineColor: () => (w ? '#a7f3d0' : '#fecaca'),
        hLineWidth: () => 1,
        vLineWidth: () => 1
      },
      margin: [0, 6, 0, 12]
    }),
    x.push({
      table: {
        widths: ['35%', '65%'],
        body: [
          ...ta(s, l).map(([a, m]) => O(a, m)),
          O(
            'Resultado',
            w ? 'CONFORME' : s.resultado === 'NO_CONFORME' ? 'NO CONFORME' : s.estado || '—'
          ),
          ...(u
            ? [
                [
                  { text: 'Estado de despacho', bold: !0 },
                  { text: ke(s).label, bold: !0, color: ke(s).color }
                ]
              ]
            : []),
          ...(We(l) ? [O('Familias de producto', We(l))] : []),
          ...(s.disposicion ? [O('Disposición / Acción a tomar', s.disposicion)] : []),
          O('Responsable de Calidad', s.realizado_nombre),
          O('Fecha de finalización', p)
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    }));
  const L = u && Array.isArray((b = s.contexto) == null ? void 0 : b.skus) ? s.contexto.skus : [];
  if (
    (L.length &&
      (x.push({ text: 'SKUs del despacho', style: 'h2' }),
      x.push({
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto'],
          body: [
            ['Código', 'Producto', 'Ubicación', 'Cantidad'].map((a) => ({
              text: a,
              bold: !0,
              fontSize: 9
            })),
            ...L.map((a) => [
              { text: a.codigo_producto || '—', fontSize: 9 },
              { text: a.producto || '—', fontSize: 9 },
              { text: a.ubicacion || '—', fontSize: 9 },
              { text: `${a.cantidad ?? '—'} ${a.unidad_medida || ''}`.trim(), fontSize: 9 }
            ])
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 12]
      })),
    d.forEach((a) => {
      (x.push({ text: a.titulo, style: 'h2' }),
        x.push({
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', '28%'],
            body: [
              ['Requisito', 'Resultado', 'Evidencia', 'Observación'].map((m) => ({
                text: m,
                bold: !0,
                fontSize: 9
              })),
              ...a.params.map((m) => {
                var N, j, A;
                const n = (N = g[m.id]) == null ? void 0 : N.estado;
                return [
                  { text: m.label, fontSize: 9 },
                  {
                    text: sa[n] || '—',
                    fontSize: 9,
                    bold: !0,
                    color: n === 'NO' ? '#be123c' : n === 'OK' ? '#047857' : '#64748b'
                  },
                  {
                    text: ((j = g[m.id]) == null ? void 0 : j.evidencia) || '—',
                    fontSize: 9,
                    color: '#475569'
                  },
                  { text: ((A = g[m.id]) == null ? void 0 : A.nota) || '', fontSize: 9 }
                ];
              })
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 12]
        }));
    }),
    !u)
  ) {
    const a = Oe(s);
    (Array.isArray(a.clasificacion) &&
      a.clasificacion.length &&
      (x.push({ text: 'Clasificación del producto', style: 'h2' }),
      x.push({
        columns: [0, 1].map((N) => ({
          stack: xs
            .filter((j, A) => A % 2 === N)
            .map((j) => ({
              text: `${a.clasificacion.includes(j.id) ? '☑' : '☐'} ${j.label}`,
              fontSize: 9,
              margin: [0, 1, 0, 1]
            }))
        })),
        columnGap: 24,
        margin: [0, 0, 0, 12]
      })),
      a.embalaje &&
        Object.values(a.embalaje).some(Boolean) &&
        (x.push({ text: 'Evaluación del embalaje', style: 'h2' }),
        x.push({
          table: {
            widths: ['35%', '65%'],
            body: ms.map((N) => {
              const j = a.embalaje[N.id] || '—',
                A =
                  ['Malo', 'Incorrecto', 'Sí'].includes(j) ||
                  (N.id === 'pallet' && j === 'Regular');
              return [
                { text: N.label, bold: !0 },
                { text: j, bold: !0, color: j === '—' ? '#64748b' : A ? '#be123c' : '#047857' }
              ];
            })
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 12]
        })));
    const m = us(s.checklist);
    x.push({
      table: {
        widths: ['35%', '65%'],
        body: [
          ...(a.disposicionInmediata
            ? [
                [
                  { text: 'Disposición inmediata', bold: !0 },
                  { text: a.disposicionInmediata, bold: !0 }
                ]
              ]
            : []),
          [
            { text: 'Riesgo de la recepción', bold: !0 },
            { text: `● ${m.label}`, bold: !0, color: m.color }
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    });
    const n = ps(s);
    (x.push({ text: 'Indicadores ISO', style: 'h2' }),
      x.push({
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
            ].map((N) => ({ text: N, bold: !0, fontSize: 8 })),
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
  if (u) {
    const a = Oe(s),
      m = bs(
        (z = a.pesos) == null ? void 0 : z.esperado,
        (P = a.pesos) == null ? void 0 : P.registrado
      );
    (((M = a.pesos) != null && M.esperado) || ((R = a.pesos) != null && R.registrado)) &&
      (x.push({ text: 'Control de peso', style: 'h2' }),
      x.push({
        table: {
          widths: ['35%', '65%'],
          body: [
            O(
              'Peso esperado',
              (_ = a.pesos) != null && _.esperado ? `${a.pesos.esperado} kg` : '—'
            ),
            O(
              'Peso registrado',
              (o = a.pesos) != null && o.registrado ? `${a.pesos.registrado} kg` : '—'
            ),
            [
              { text: 'Resultado', bold: !0 },
              { text: m || '—', bold: !0, color: m === 'CONFORME' ? '#047857' : '#be123c' }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 12]
      }));
    const n = Number(a.bultosTotal ?? s.bultos) || 0;
    if (n > 0) {
      const j = Array.isArray(a.bultosEtiquetas) ? a.bultosEtiquetas : [];
      (x.push({ text: 'Verificación de bultos', style: 'h2' }),
        x.push({
          table: {
            headerRows: 1,
            widths: ['auto', '*'],
            body: [
              ['Bulto', 'Etiqueta'].map((A) => ({ text: A, bold: !0, fontSize: 9 })),
              ...Array.from({ length: Math.min(n, 60) }, (A, Y) => [
                { text: `Bulto ${Y + 1}/${n}`, fontSize: 9 },
                {
                  text: j[Y] ? 'Etiqueta OK' : 'Pendiente',
                  fontSize: 9,
                  bold: !0,
                  color: j[Y] ? '#047857' : '#b45309'
                }
              ])
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 12]
        }));
    }
    Array.isArray(a.riesgos) &&
      a.riesgos.length &&
      (x.push({ text: 'Riesgos evaluados', style: 'h2' }),
      x.push({
        columns: [0, 1].map((j) => ({
          stack: hs
            .filter((A, Y) => Y % 2 === j)
            .map((A) => ({
              text: `${a.riesgos.includes(A.id) ? '☑' : '☐'} ${A.label}`,
              fontSize: 9,
              margin: [0, 1, 0, 1]
            }))
        })),
        columnGap: 24,
        margin: [0, 0, 0, 12]
      }));
    const N = Array.isArray(l.evidenciasImg) ? l.evidenciasImg : [];
    if (N.length || (Array.isArray(a.evidencias) && a.evidencias.length))
      if ((x.push({ text: 'Evidencia fotográfica', style: 'h2' }), N.length))
        for (let j = 0; j < N.length; j += 2)
          x.push({
            columns: N.slice(j, j + 2).map((A) => ({
              width: '50%',
              stack: [
                { image: A.dataUrl, fit: [230, 160] },
                { text: Je[A.tipo] || A.tipo, fontSize: 8, color: '#64748b', margin: [0, 2, 0, 0] }
              ]
            })),
            columnGap: 12,
            margin: [0, 0, 0, 8]
          });
      else
        x.push({
          text: `${(a.evidencias || []).length} foto(s) asociada(s) al certificado en el sistema CCO.`,
          fontSize: 9,
          color: '#64748b',
          margin: [0, 0, 0, 12]
        });
  }
  if (!u) {
    const a = Oe(s),
      m = Array.isArray(l.evidenciasImg) ? l.evidenciasImg : [];
    if (m.length || (Array.isArray(a.evidencias) && a.evidencias.length))
      if ((x.push({ text: 'Evidencia fotográfica', style: 'h2' }), m.length))
        for (let n = 0; n < m.length; n += 2)
          x.push({
            columns: m.slice(n, n + 2).map((N) => ({
              width: '50%',
              stack: [
                { image: N.dataUrl, fit: [230, 160] },
                { text: Je[N.tipo] || N.tipo, fontSize: 8, color: '#64748b', margin: [0, 2, 0, 0] }
              ]
            })),
            columnGap: 12,
            margin: [0, 0, 0, 8]
          });
      else
        x.push({
          text: `${(a.evidencias || []).length} foto(s) asociada(s) al checklist en el sistema CCO.`,
          fontSize: 9,
          color: '#64748b',
          margin: [0, 0, 0, 12]
        });
  }
  if (
    (s.observaciones &&
      (x.push({ text: 'Observaciones', style: 'h2' }),
      x.push({ text: s.observaciones, margin: [0, 0, 0, 12] })),
    x.push({
      columns: [
        {
          stack: [
            { text: '_______________________________', margin: [0, 20, 0, 0] },
            { text: s.realizado_nombre || 'Nombre / Firma', bold: !0 },
            {
              text: u ? 'Calidad — Certificación de salida' : 'Calidad — Inspección de ingreso',
              fontSize: 9,
              color: '#64748b'
            }
          ]
        },
        {
          stack: [
            { text: '_______________________________', margin: [0, 20, 0, 0] },
            { text: 'Nombre / Firma', bold: !0 },
            { text: u ? 'Despacho / Bodega' : 'Recepción / Bodega', fontSize: 9, color: '#64748b' }
          ]
        }
      ],
      columnGap: 24
    }),
    s.firma_digital)
  ) {
    const a = `${window.location.origin}/verificar?folio=${encodeURIComponent(s.folio || '')}`;
    x.push({
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
            { qr: a, fit: 84, foreground: '#0f172a', margin: [0, 2, 0, 0] },
            { text: 'Escanee para verificar', fontSize: 7, alignment: 'center', color: '#64748b' }
          ]
        }
      ],
      columnGap: 16,
      margin: [0, 14, 0, 0]
    });
  }
  h.createPdf({
    pageMargins: Ns,
    header: js(ts(s, l)),
    footer: vs(ts(s, l)),
    content: x,
    defaultStyle: { fontSize: 10 },
    styles: {
      title: { fontSize: 16, bold: !0, alignment: 'center', margin: [0, 0, 0, 2] },
      h2: { fontSize: 12, bold: !0, margin: [0, 10, 0, 4] }
    }
  }).download(oa(s, 'pdf'));
}
const Ot = (s) => ({
    nivel: `cat_${s.codigo}`,
    titulo: `Requisitos específicos — ${s.label}${s.clase_riesgo ? ` (Clase ${s.clase_riesgo})` : ''}`,
    categoria: s.codigo,
    params: s.params || []
  }),
  os = {
    IMPORTACION: { label: 'Importación', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    NACIONAL: { label: 'Nacional', cls: 'bg-teal-100 text-teal-700 border-teal-200' }
  },
  St = ({ tarea: s, onBack: d, canManage: l, onGenerarDanos: c }) => {
    var ue, i, T, B;
    const { user: E } = ye(),
      h = Hs(),
      t = Ks(),
      { data: g, isLoading: u } = Aa(s.id),
      w = s.estado === 'CONFORME' || s.estado === 'NO_CONFORME',
      p = w || !l,
      O = (r) => {
        const { _extras: k, ...U } = r || {};
        return { resp: U, extras: k || {} };
      },
      [x, L] = f.useState(() => O(s.checklist).resp),
      [v, b] = f.useState(() => O(s.checklist).extras),
      [z, P] = f.useState(s.observaciones || ''),
      [M, R] = f.useState(s.disposicion || '');
    f.useEffect(() => {
      const { resp: r, extras: k } = O(s.checklist);
      (L(r), b(k), P(s.observaciones || ''), R(s.disposicion || ''));
    }, [s.id]);
    const _ = (r, k) => L((U) => ({ ...U, [r]: { ...U[r], estado: k } })),
      o = (r, k) => L((U) => ({ ...U, [r]: { ...U[r], nota: k } })),
      a = (r, k) => L((U) => ({ ...U, [r]: { ...U[r], evidencia: k } })),
      m = (r, k) => b((U) => ({ ...U, [r]: k })),
      n = (r = v) => ({ ...x, _extras: r }),
      N = (r) =>
        b((k) => {
          const U = new Set(k.clasificacion || []);
          return (U.has(r) ? U.delete(r) : U.add(r), { ...k, clasificacion: [...U] });
        }),
      j = (g == null ? void 0 : g.categorias) || [],
      A = !!(g != null && g.solo_no_sanitario),
      Y = (g == null ? void 0 : g.sin_clasificar) || 0,
      J = f.useMemo(() => {
        const r = j.filter((k) => (k.params || []).length > 0).map(Ot);
        return [...Oa, ...r];
      }, [j]),
      F = f.useMemo(() => J.flatMap((r) => r.params), [J]),
      {
        answeredAll: W,
        hasNo: Z,
        faltan: ne
      } = f.useMemo(() => {
        var U;
        let r = 0,
          k = !1;
        for (const K of F) {
          const ce = (U = x[K.id]) == null ? void 0 : U.estado;
          (ce && r++, ce === 'NO' && (k = !0));
        }
        return { answeredAll: r === F.length, hasNo: k, faltan: F.length - r };
      }, [x, F]),
      xe = async () => {
        if (
          confirm(
            '¿Firmar digitalmente este documento? Quedará sellado y verificable por folio/QR. No se puede deshacer.'
          )
        )
          try {
            const r = await t.mutateAsync(s.id);
            S.success(
              `Documento firmado digitalmente por ${(r == null ? void 0 : r.firmado_nombre) || ''}`
            );
          } catch (r) {
            S.error(`No se pudo firmar: ${r.message}`);
          }
      },
      oe = async (r) => {
        try {
          const k = { categorias: j, soloNoSanitario: A };
          if (r === 'pdf') {
            const U = v.evidencias || [],
              K = [];
            for (const ce of U)
              try {
                const ve = await cs(Pe, ce.path);
                if (!ve) continue;
                const Ce = await fetch(ve).then((Ae) => (Ae.ok ? Ae.blob() : null));
                if (!Ce || !/image\/(jpeg|png)/.test(Ce.type)) continue;
                const Me = await new Promise((Ae, je) => {
                  const Be = new FileReader();
                  ((Be.onload = () => Ae(Be.result)), (Be.onerror = je), Be.readAsDataURL(Ce));
                });
                K.push({ tipo: ce.tipo, dataUrl: Me });
              } catch {}
            ((k.evidenciasImg = K), await na(s, J, k));
          } else await ra(s, J, k);
        } catch (k) {
          S.error(`No se pudo generar el documento: ${k.message}`);
        }
      },
      D = async () => {
        try {
          (await h.mutateAsync({
            tareaId: s.id,
            checklist: n(),
            observaciones: z,
            disposicion: M,
            finalizar: !1
          }),
            S.success('Avance guardado'));
        } catch (r) {
          S.error(`No se pudo guardar: ${r.message}`);
        }
      },
      V = async () => {
        if (u) {
          S.error('Cargando las familias de producto de la recepción…');
          return;
        }
        if (!W) {
          S.error(`Faltan ${ne} ítem(s) por responder`);
          return;
        }
        const r = Z ? 'NO_CONFORME' : 'CONFORME';
        if (r === 'NO_CONFORME' && !M) {
          S.error('Selecciona la Disposición / Acción a tomar antes de finalizar');
          return;
        }
        if (r === 'NO_CONFORME' && !v.disposicionInmediata) {
          S.error('Marca la Disposición inmediata de la recepción (cuarentena, rechazo, etc.)');
          return;
        }
        if (
          confirm(
            r === 'CONFORME'
              ? 'Todos los ítems conformes → se CERTIFICARÁ automáticamente (se emite folio CERT-) y la tarea quedará bloqueada. ¿Continuar?'
              : `Hay ítems NO conformes → se marcará NO CONFORME (folio ACTA-), disposición "${M}", y se generará la tarea urgente del Informe de Daños. ¿Continuar?`
          )
        )
          try {
            const k = await h.mutateAsync({
              tareaId: s.id,
              checklist: n(),
              observaciones: z,
              disposicion: M,
              finalizar: !0,
              resultado: r
            });
            r === 'CONFORME'
              ? (S.success(
                  `Certificado automáticamente ${(k == null ? void 0 : k.folio) || ''} — recepción CONFORME`
                ),
                d())
              : S.warning('Recepción NO CONFORME. Tarea urgente del Informe de Daños generada.');
          } catch (k) {
            S.error(`No se pudo finalizar: ${k.message}`);
          }
      },
      se = ({ pid: r, val: k, icon: U, activeCls: K }) => {
        var ve;
        const ce = ((ve = x[r]) == null ? void 0 : ve.estado) === k;
        return e.jsx('button', {
          type: 'button',
          disabled: p,
          onClick: () => _(r, k),
          className: `w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shrink-0
          ${ce ? K : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'} ${p ? 'opacity-60 cursor-default' : ''}`,
          children: U
        });
      },
      X = ze[s.estado] || {},
      y = f.useMemo(() => us({ ...x, _extras: v }), [x, v]),
      G = f.useMemo(() => ps({ ...s, checklist: { ...x, _extras: v } }), [x, v, s]),
      q =
        G.minutos ??
        (s.created_at
          ? Math.max(0, Math.round((Date.now() - new Date(s.created_at).getTime()) / 6e4))
          : null),
      le = v.embalaje || {},
      ae = Ts.useRef(null),
      [me, I] = f.useState(!1),
      Q = typeof navigator < 'u' && navigator.maxTouchPoints > 0,
      [ee, de] = f.useState(null),
      [te, Ne] = f.useState(!1),
      [C, $] = f.useState({}),
      H = v.evidencias || [];
    f.useEffect(() => {
      let r = !0;
      return (
        ds(
          Pe,
          H.map((k) => k.path)
        ).then((k) => {
          r && $(k);
        }),
        () => {
          r = !1;
        }
      );
    }, [JSON.stringify(H.map((r) => r.path))]);
    const re = (r, k = 'galeria') => {
        var U;
        (de(r), k === 'camara' ? I(!0) : (U = ae.current) == null || U.click());
      },
      ie = async (r) => {
        var U;
        const k = Array.from(r.target.files || []);
        if (((r.target.value = ''), !(!k.length || !ee))) {
          Ne(!0);
          try {
            const K = [];
            for (const ce of k) {
              if (!ce.type.startsWith('image/')) continue;
              const ve = await ws(ce),
                Ce = await za({ tareaId: s.id, tipo: ee, blob: ve });
              K.push({ tipo: ee, path: Ce, subido_en: new Date().toISOString() });
            }
            if (K.length) {
              const ce = { ...v, evidencias: [...H, ...K] };
              (b(ce),
                await h.mutateAsync({
                  tareaId: s.id,
                  checklist: n(ce),
                  observaciones: z,
                  disposicion: M,
                  finalizar: !1
                }),
                S.success(K.length > 1 ? 'Fotos agregadas' : 'Foto agregada'));
            }
          } catch (K) {
            S.error(
              (U = K == null ? void 0 : K.message) != null && U.includes('row-level security')
                ? 'No tienes permiso para subir fotos'
                : `Error al subir: ${K.message}`
            );
          } finally {
            (Ne(!1), de(null));
          }
        }
      },
      be = async (r) => {
        if (confirm('¿Eliminar esta foto?'))
          try {
            await Js(r.path);
            const k = { ...v, evidencias: H.filter((U) => U.path !== r.path) };
            (b(k),
              await h.mutateAsync({
                tareaId: s.id,
                checklist: n(k),
                observaciones: z,
                disposicion: M,
                finalizar: !1
              }),
              S.success('Foto eliminada'));
          } catch {
            S.error('No se pudo eliminar la foto');
          }
      };
    return e.jsxs('div', {
      children: [
        e.jsxs('button', {
          onClick: d,
          className:
            'flex items-center gap-2 text-slate-500 font-bold text-sm mb-4 hover:text-slate-800',
          children: [e.jsx(Ie, { size: 18 }), ' Volver a la cola']
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
                  children: e.jsx(ls, { size: 26 })
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
                          className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${((ue = os[s.origen]) == null ? void 0 : ue.cls) || ''}`,
                          children: ((i = os[s.origen]) == null ? void 0 : i.label) || s.origen
                        }),
                        e.jsx('span', {
                          className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${X.cls || ''}`,
                          children: X.label || s.estado
                        })
                      ]
                    }),
                    e.jsxs('p', {
                      className:
                        'text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-3',
                      children: [
                        e.jsxs('span', {
                          className: 'flex items-center gap-1',
                          children: [e.jsx(Qe, { size: 12 }), ' OC ', s.oc || '—']
                        }),
                        e.jsxs('span', {
                          className: 'flex items-center gap-1',
                          children: [e.jsx(Ls, { size: 12 }), ' ', s.fecha_recepcion || '—']
                        }),
                        s.bultos != null &&
                          e.jsxs('span', { children: ['· ', s.bultos, ' bultos'] }),
                        ((T = s.contexto) == null ? void 0 : T.pallets) != null &&
                          e.jsxs('span', { children: ['· ', s.contexto.pallets, ' pallets'] }),
                        ((B = s.contexto) == null ? void 0 : B.tipo_contenedor) &&
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
                      onClick: () => oe('pdf'),
                      title: 'Descargar PDF',
                      className:
                        'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                      children: [e.jsx(Ps, { size: 15 }), ' PDF']
                    }),
                    e.jsxs('button', {
                      onClick: () => oe('word'),
                      title: 'Descargar Word',
                      className:
                        'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                      children: [e.jsx(De, { size: 15 }), ' Word']
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
                e.jsx(He, { size: 22, className: 'text-emerald-600 shrink-0 mt-0.5' }),
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
          : w && l
            ? e.jsxs('div', {
                className:
                  'bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3',
                children: [
                  e.jsxs('div', {
                    className: 'text-sm text-slate-600 flex items-center gap-2',
                    children: [
                      e.jsx(Ke, { size: 18, className: 'text-slate-400' }),
                      ' Documento sin firmar.'
                    ]
                  }),
                  e.jsxs('button', {
                    onClick: xe,
                    disabled: t.isPending,
                    className:
                      'px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50',
                    children: [e.jsx(Ke, { size: 16 }), ' Firmar digitalmente']
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
                e.jsx(xa, { size: 16, className: 'text-slate-400' }),
                e.jsx('h3', {
                  className: 'text-sm font-black text-slate-800',
                  children: 'Familias de producto de la recepción'
                }),
                u && e.jsx(pe, { size: 14, className: 'animate-spin text-slate-300' })
              ]
            }),
            j.length === 0
              ? e.jsx('p', {
                  className: 'text-xs text-slate-400',
                  children: u
                    ? 'Detectando familias…'
                    : 'Sin ítems clasificables en la recepción. Se aplican solo los controles universales.'
                })
              : e.jsx('div', {
                  className: 'flex flex-wrap gap-2',
                  children: j.map((r) => {
                    var k;
                    return e.jsxs(
                      'span',
                      {
                        className: `text-[11px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${((k = Sa[r.codigo]) == null ? void 0 : k.cls) || 'bg-slate-100 text-slate-600 border-slate-200'}`,
                        title: r.descripcion || '',
                        children: [
                          r.label,
                          ' · ',
                          r.items,
                          r.clase_riesgo &&
                            e.jsxs('span', {
                              className: 'opacity-70',
                              children: ['Clase ', r.clase_riesgo]
                            }),
                          !r.es_dispositivo_medico &&
                            e.jsx('span', { className: 'opacity-70', children: '· no sanitario' })
                        ]
                      },
                      r.codigo
                    );
                  })
                }),
            (g == null ? void 0 : g.requiere_registro_isp) &&
              e.jsxs('p', {
                className:
                  'mt-3 text-[11px] text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg px-3 py-2 flex items-start gap-1.5',
                children: [
                  e.jsx(Cs, { size: 13, className: 'mt-0.5 shrink-0' }),
                  'Contiene insumos de posible ',
                  e.jsx('b', { children: 'control obligatorio ISP' }),
                  ' (jeringas, agujas, guantes, preservativos): verifique el ',
                  e.jsx('b', { children: 'N° de registro sanitario' }),
                  ' en la sección de insumo estéril.'
                ]
              }),
            A &&
              e.jsxs('p', {
                className:
                  'mt-3 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-start gap-1.5',
                children: [
                  e.jsx(Cs, { size: 13, className: 'mt-0.5 shrink-0' }),
                  'Recepción de ',
                  e.jsx('b', { children: 'producto no sanitario' }),
                  ' (bienestar / empaque). El documento se emite como conformidad de recepción,',
                  ' ',
                  e.jsx('b', { children: 'no como certificado de dispositivo médico ISO 13485' }),
                  '.'
                ]
              }),
            Y > 0 &&
              e.jsxs('p', {
                className:
                  'mt-3 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 flex items-start gap-1.5',
                children: [
                  e.jsx(fe, { size: 13, className: 'mt-0.5 shrink-0' }),
                  Y,
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
                e.jsx(Re, { size: 16, className: 'text-slate-400' }),
                ' Clasificación del producto'
              ]
            }),
            e.jsx('div', {
              className: 'flex flex-wrap gap-2',
              children: xs.map((r) => {
                const k = (v.clasificacion || []).includes(r.id);
                return e.jsxs(
                  'button',
                  {
                    type: 'button',
                    disabled: p,
                    onClick: () => N(r.id),
                    className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${k ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'}`,
                    children: [k ? '☑' : '☐', ' ', r.label]
                  },
                  r.id
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
                    e.jsx(Re, { size: 16, className: 'text-slate-400' }),
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
                    onClick: () => m('embalaje', { ...le, ...As.conforme }),
                    className:
                      'px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-black hover:bg-emerald-100 inline-flex items-center gap-1.5',
                    children: [e.jsx(Se, { size: 13 }), ' Todo conforme']
                  }),
                  e.jsxs('button', {
                    type: 'button',
                    onClick: () => m('embalaje', { ...le, ...As.sinPallet }),
                    className:
                      'px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs font-black hover:bg-slate-100 inline-flex items-center gap-1.5',
                    children: [e.jsx(ss, { size: 13 }), ' Sin pallet / film (N/A)']
                  }),
                  e.jsx('button', {
                    type: 'button',
                    onClick: () => m('embalaje', {}),
                    className:
                      'px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 text-xs font-bold hover:text-slate-600',
                    children: 'Limpiar'
                  })
                ]
              }),
            e.jsx('div', {
              className: 'space-y-2.5',
              children: ms.map((r) =>
                e.jsxs(
                  'div',
                  {
                    className:
                      'flex items-center justify-between gap-3 py-1.5 border-b border-slate-50 last:border-0 flex-wrap',
                    children: [
                      e.jsx('p', {
                        className: 'text-sm text-slate-700 font-semibold',
                        children: r.label
                      }),
                      e.jsx('div', {
                        className: 'flex gap-1.5 flex-wrap',
                        children: r.opciones.map((k) => {
                          const U = le[r.id] === k,
                            K =
                              ['Malo', 'Incorrecto', 'Sí'].includes(k) ||
                              (r.id === 'pallet' && k === 'Regular'),
                            ce = k === Da;
                          return e.jsx(
                            'button',
                            {
                              type: 'button',
                              disabled: p,
                              onClick: () => m('embalaje', { ...le, [r.id]: U ? void 0 : k }),
                              className: `px-3 py-1.5 rounded-lg border text-xs font-black transition-colors ${U ? (ce ? 'bg-slate-400 border-slate-400 text-white' : K ? 'bg-rose-500 border-rose-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white') : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`,
                              children: k
                            },
                            k
                          );
                        })
                      })
                    ]
                  },
                  r.id
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
            J.map((r) =>
              e.jsxs(
                'div',
                {
                  className: `bg-white rounded-2xl border p-5 ${r.categoria ? 'border-emerald-200' : 'border-slate-200'}`,
                  children: [
                    e.jsxs('h3', {
                      className: 'text-sm font-black text-slate-800 mb-3 flex items-center gap-2',
                      children: [
                        r.categoria &&
                          e.jsx(ma, { size: 14, className: 'text-emerald-500 shrink-0' }),
                        r.titulo
                      ]
                    }),
                    e.jsx('div', {
                      className: 'space-y-2.5',
                      children: r.params.map((k) => {
                        var U, K, ce, ve, Ce, Me, Ae;
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
                                    children: k.label
                                  }),
                                  ((U = x[k.id]) == null ? void 0 : U.estado) &&
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
                                            ((K = x[k.id]) == null ? void 0 : K.evidencia) || '',
                                          disabled: p,
                                          onChange: (je) => a(k.id, je.target.value),
                                          className: `px-2 py-1 rounded-lg border text-[11px] font-bold ${(ce = x[k.id]) != null && ce.evidencia ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 text-slate-400'}`,
                                          children: [
                                            e.jsx('option', {
                                              value: '',
                                              children: '— cómo se verificó —'
                                            }),
                                            qs.map((je) =>
                                              e.jsx('option', { value: je, children: je }, je)
                                            )
                                          ]
                                        })
                                      ]
                                    }),
                                  ((ve = x[k.id]) == null ? void 0 : ve.estado) === 'NO' &&
                                    e.jsx('input', {
                                      value: ((Ce = x[k.id]) == null ? void 0 : Ce.nota) || '',
                                      disabled: p,
                                      onChange: (je) => o(k.id, je.target.value),
                                      placeholder: 'Detalle de la no conformidad…',
                                      className:
                                        'mt-1.5 w-full px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/40 text-xs outline-none focus:border-rose-400'
                                    }),
                                  ((Me = x[k.id]) == null ? void 0 : Me.estado) === 'NA' &&
                                    e.jsx('input', {
                                      value: ((Ae = x[k.id]) == null ? void 0 : Ae.nota) || '',
                                      disabled: p,
                                      onChange: (je) => o(k.id, je.target.value),
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
                                  e.jsx(se, {
                                    pid: k.id,
                                    val: 'OK',
                                    icon: e.jsx(Se, { size: 16 }),
                                    activeCls: 'bg-emerald-500 border-emerald-500 text-white'
                                  }),
                                  e.jsx(se, {
                                    pid: k.id,
                                    val: 'NO',
                                    icon: e.jsx($e, { size: 16 }),
                                    activeCls: 'bg-rose-500 border-rose-500 text-white'
                                  }),
                                  e.jsx(se, {
                                    pid: k.id,
                                    val: 'NA',
                                    icon: e.jsx(ss, { size: 16 }),
                                    activeCls: 'bg-slate-400 border-slate-400 text-white'
                                  })
                                ]
                              })
                            ]
                          },
                          k.id
                        );
                      })
                    })
                  ]
                },
                r.nivel
              )
            ),
            e.jsxs('div', {
              className: `bg-white rounded-2xl border p-5 ${Z && !v.disposicionInmediata ? 'border-rose-200' : 'border-slate-200'}`,
              children: [
                e.jsxs('label', {
                  className: `text-[10px] font-black uppercase tracking-widest ${Z && !v.disposicionInmediata ? 'text-rose-500' : 'text-slate-400'}`,
                  children: [
                    'Disposición inmediata ',
                    Z && e.jsx('span', { children: '*obligatoria (hay no conformes)' })
                  ]
                }),
                e.jsx('div', {
                  className: 'flex flex-wrap gap-2 mt-2',
                  children: Ra.map((r) => {
                    const k = v.disposicionInmediata === r,
                      U = ['Cuarentena', 'Rechazo proveedor', 'Devuelto'].includes(r);
                    return e.jsxs(
                      'button',
                      {
                        type: 'button',
                        disabled: p,
                        onClick: () => m('disposicionInmediata', k ? void 0 : r),
                        className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${k ? (U ? 'bg-rose-500 border-rose-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white') : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`,
                        children: [k ? '☑' : '☐', ' ', r]
                      },
                      r
                    );
                  })
                })
              ]
            }),
            (Z || M) &&
              e.jsxs('div', {
                className: `rounded-2xl border p-5 ${Z ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'}`,
                children: [
                  e.jsxs('label', {
                    className:
                      'text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-rose-500',
                    children: [
                      'Disposición / Acción a tomar ',
                      Z && e.jsx('span', { children: '*obligatoria' })
                    ]
                  }),
                  e.jsxs('select', {
                    value: M,
                    disabled: p,
                    onChange: (r) => R(r.target.value),
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
                  value: z,
                  disabled: p,
                  onChange: (r) => P(r.target.value),
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
                    e.jsx(Te, { size: 16, className: 'text-slate-400' }),
                    ' Evidencia fotográfica'
                  ]
                }),
                e.jsx('div', {
                  className: 'grid sm:grid-cols-2 lg:grid-cols-4 gap-3',
                  children: Ia.map((r) => {
                    const k = H.filter((U) => U.tipo === r.id);
                    return e.jsxs(
                      'div',
                      {
                        className: 'rounded-xl border border-slate-100 p-3',
                        children: [
                          e.jsxs('p', {
                            className:
                              'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2',
                            children: ['📷 ', r.label, ' (', k.length, ')']
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2 flex-wrap',
                            children: [
                              k.map((U) =>
                                e.jsxs(
                                  'div',
                                  {
                                    className:
                                      'relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0',
                                    children: [
                                      e.jsx('a', {
                                        href: C[U.path] || '#',
                                        target: '_blank',
                                        rel: 'noreferrer',
                                        children: e.jsx('img', {
                                          src: C[U.path] || '',
                                          alt: r.label,
                                          className: 'w-full h-full object-cover'
                                        })
                                      }),
                                      !p &&
                                        e.jsx('button', {
                                          onClick: () => be(U),
                                          title: 'Eliminar foto',
                                          className:
                                            'absolute top-0.5 right-0.5 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity',
                                          children: e.jsx(he, { size: 11 })
                                        })
                                    ]
                                  },
                                  U.path
                                )
                              ),
                              !p &&
                                Q &&
                                e.jsxs('button', {
                                  type: 'button',
                                  onClick: () => re(r.id, 'camara'),
                                  disabled: te,
                                  title: 'Tomar foto con la cámara',
                                  className:
                                    'w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-emerald-300 text-emerald-500 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40',
                                  children: [
                                    te && ee === r.id
                                      ? e.jsx(_e, { size: 16, className: 'animate-spin' })
                                      : e.jsx(Te, { size: 16 }),
                                    e.jsx('span', {
                                      className: 'text-[8px] font-black uppercase',
                                      children: 'Cámara'
                                    })
                                  ]
                                }),
                              !p &&
                                e.jsxs('button', {
                                  type: 'button',
                                  onClick: () => re(r.id, 'galeria'),
                                  disabled: te,
                                  title: 'Subir foto desde archivos/galería',
                                  className:
                                    'w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40',
                                  children: [
                                    te && ee === r.id
                                      ? e.jsx(_e, { size: 16, className: 'animate-spin' })
                                      : e.jsx(ns, { size: 16 }),
                                    e.jsx('span', {
                                      className: 'text-[8px] font-black uppercase',
                                      children: Q ? 'Galería' : 'Foto'
                                    })
                                  ]
                                }),
                              k.length === 0 &&
                                p &&
                                e.jsx('span', {
                                  className: 'text-xs text-slate-300',
                                  children: 'Sin fotos'
                                })
                            ]
                          })
                        ]
                      },
                      r.id
                    );
                  })
                }),
                e.jsx('input', {
                  ref: ae,
                  type: 'file',
                  accept: 'image/*',
                  multiple: !0,
                  onChange: ie,
                  className: 'hidden'
                }),
                me &&
                  e.jsx(ys, {
                    onCapture: (r) => ie({ target: { files: [r], value: '' } }),
                    onClose: () => I(!1)
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
                    ['Tiempo recepción', q != null ? `${q} min` : '—'],
                    ['Inspector', G.inspector || (E == null ? void 0 : E.nombre) || '—'],
                    ['N° ítems', G.items || 0],
                    ['Conformes', G.ok || 0],
                    ['No conformes', G.no || 0],
                    ['Resultado', G.pct != null ? `${String(G.pct).replace('.', ',')}%` : '—']
                  ].map(([r, k]) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'rounded-xl border border-slate-100 bg-slate-50/60 p-3',
                        children: [
                          e.jsx('div', {
                            className:
                              'text-[10px] font-black text-slate-400 uppercase tracking-wide',
                            children: r
                          }),
                          e.jsx('div', {
                            className: `text-lg font-black ${r === 'No conformes' && G.no > 0 ? 'text-rose-600' : 'text-slate-900'} truncate`,
                            title: String(k),
                            children: k
                          })
                        ]
                      },
                      r
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
                  ne > 0
                    ? e.jsxs('span', {
                        className: 'text-slate-500',
                        children: [ne, ' ítem(s) por responder']
                      })
                    : Z
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
                    disabled: h.isPending,
                    className:
                      'px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50',
                    children: 'Guardar avance'
                  }),
                  e.jsx('button', {
                    onClick: V,
                    disabled: h.isPending || ne > 0,
                    className: `px-4 py-2.5 rounded-xl text-white font-black text-sm flex items-center gap-2 disabled:opacity-40 ${Z ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`,
                    children: Z
                      ? e.jsxs(e.Fragment, {
                          children: [e.jsx(ks, { size: 16 }), ' Finalizar (No Conforme)']
                        })
                      : e.jsxs(e.Fragment, {
                          children: [e.jsx(Le, { size: 16 }), ' Finalizar y certificar']
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
                  e.jsx(fe, { size: 16 }),
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
                  children: [e.jsx(ks, { size: 16 }), ' Generar Informe de Daños']
                })
            ]
          })
      ]
    });
  },
  Rt = ({ onGenerarDanos: s }) => {
    const { hasPermission: d, user: l } = ye(),
      c = d('manage_quality') || d('manage_monitoreo'),
      E = (l == null ? void 0 : l.rol) === 'ADMIN' || (l == null ? void 0 : l.es_admin_delegado),
      { data: h = [], isLoading: t, refetch: g, isFetching: u } = Ea(),
      w = Vs(),
      [p, O] = f.useState(null),
      [x, L] = f.useState(''),
      [v, b] = f.useState('TODOS'),
      z = async (_, o) => {
        if (
          (o.stopPropagation(),
          !!confirm(
            `¿Eliminar la tarea de ${_.proveedor || 'recepción'} (OC ${_.oc || '—'})? Esta acción no se puede deshacer.`
          ))
        )
          try {
            (await w.mutateAsync(_.id), S.success('Tarea eliminada'));
          } catch (a) {
            S.error(`No se pudo eliminar: ${a.message}`);
          }
      },
      P = h.filter((_) => _.estado === 'PENDIENTE' || _.estado === 'EN_PROCESO').length,
      M = f.useMemo(() => {
        const _ = x.trim().toLocaleLowerCase('es-CL');
        return h.filter(
          (o) =>
            (!_ ||
              [o.oc, o.proveedor, o.folio, o.origen].some((m) =>
                String(m || '')
                  .toLocaleLowerCase('es-CL')
                  .includes(_)
              )) &&
            (v === 'TODOS' || o.estado === v)
        );
      }, [x, v, h]),
      R = p ? h.find((_) => _.id === p.id) || p : null;
    return R
      ? e.jsx(St, { tarea: R, onBack: () => O(null), canManage: c, onGenerarDanos: s })
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
                      onClick: () => g(),
                      disabled: u,
                      className:
                        'px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                      children: [
                        e.jsx(_e, { size: 14, className: u ? 'animate-spin' : '' }),
                        ' Actualizar'
                      ]
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2',
                  children: [
                    e.jsx(Xe, { label: 'Total', value: h.length, tone: 'slate' }),
                    e.jsx(Xe, { label: 'Por revisar', value: P, tone: 'amber' }),
                    e.jsx(Xe, { label: 'Finalizadas', value: h.length - P, tone: 'emerald' })
                  ]
                }),
                e.jsxs('div', {
                  className: 'mt-4 flex flex-col lg:flex-row gap-2',
                  children: [
                    e.jsxs('label', {
                      className: 'relative flex-1',
                      children: [
                        e.jsx(ge, {
                          size: 16,
                          className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                        }),
                        e.jsx('input', {
                          value: x,
                          onChange: (_) => L(_.target.value),
                          placeholder: 'Buscar OC, nombre de proveedor o folio…',
                          className:
                            'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'
                        })
                      ]
                    }),
                    e.jsx('div', {
                      className: 'flex gap-1 overflow-x-auto pb-0.5',
                      children: ['TODOS', 'PENDIENTE', 'EN_PROCESO', 'CONFORME', 'NO_CONFORME'].map(
                        (_) => {
                          var o;
                          return e.jsx(
                            'button',
                            {
                              onClick: () => b(_),
                              className: `whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-black tracking-wide transition ${v === _ ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-200'}`,
                              children:
                                _ === 'TODOS'
                                  ? 'Todos'
                                  : ((o = ze[_]) == null ? void 0 : o.label) || _
                            },
                            _
                          );
                        }
                      )
                    })
                  ]
                }),
                !t &&
                  e.jsxs('p', {
                    className: 'mt-2 text-[11px] font-bold text-slate-400',
                    children: ['Mostrando ', M.length, ' de ', h.length, ' recepciones.']
                  })
              ]
            }),
            t
              ? e.jsx('div', {
                  className: 'flex justify-center py-20',
                  children: e.jsx(pe, { className: 'animate-spin text-emerald-500', size: 36 })
                })
              : h.length === 0
                ? e.jsxs('div', {
                    className: 'flex flex-col items-center justify-center py-20 text-center',
                    children: [
                      e.jsx(ls, { size: 44, className: 'text-slate-200 mb-4' }),
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
                : M.length === 0
                  ? e.jsxs('div', {
                      className:
                        'rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center',
                      children: [
                        e.jsx(ge, { size: 34, className: 'mx-auto mb-3 text-slate-300' }),
                        e.jsx('h3', {
                          className: 'font-bold text-slate-500',
                          children: 'No hay coincidencias'
                        }),
                        e.jsx('button', {
                          onClick: () => {
                            (L(''), b('TODOS'));
                          },
                          className:
                            'mt-2 text-xs font-black text-emerald-600 hover:text-emerald-700',
                          children: 'Limpiar filtros'
                        })
                      ]
                    })
                  : e.jsx('div', {
                      className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
                      children: M.map((_) => {
                        var n, N, j;
                        const o = ze[_.estado] || {},
                          a = os[_.origen] || {},
                          m = _.estado === 'PENDIENTE' || _.estado === 'EN_PROCESO';
                        return e.jsxs(
                          'div',
                          {
                            role: 'button',
                            tabIndex: 0,
                            onClick: () => O(_),
                            className: `cursor-pointer text-left bg-white rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${m ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-emerald-300'}`,
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center justify-between mb-3 gap-2',
                                children: [
                                  e.jsxs('span', {
                                    className:
                                      'flex items-center gap-1.5 font-black text-slate-900 truncate',
                                    children: [
                                      e.jsx(Re, { size: 16, className: 'text-slate-400 shrink-0' }),
                                      _.proveedor || 'Sin proveedor'
                                    ]
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-1.5 shrink-0',
                                    children: [
                                      e.jsx('span', {
                                        className: `text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${o.cls}`,
                                        children: o.label || _.estado
                                      }),
                                      E &&
                                        e.jsx('button', {
                                          onClick: (A) => z(_, A),
                                          title: 'Eliminar (admin)',
                                          className:
                                            'p-1.5 rounded-lg text-slate-300 hover:bg-rose-100 hover:text-rose-600',
                                          children: e.jsx(he, { size: 14 })
                                        })
                                    ]
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'flex items-center gap-2 mb-2',
                                children: [
                                  e.jsx('span', {
                                    className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${a.cls}`,
                                    children: a.label || _.origen
                                  }),
                                  _.folio &&
                                    e.jsx('span', {
                                      className:
                                        'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-600 border-emerald-200 font-mono',
                                      children: _.folio
                                    })
                                ]
                              }),
                              e.jsxs('p', {
                                className: 'text-sm text-slate-500 font-medium',
                                children: ['OC ', _.oc || '—', ' · ', _.fecha_recepcion || '—']
                              }),
                              (_.bultos != null ||
                                ((n = _.contexto) == null ? void 0 : n.pallets) != null) &&
                                e.jsxs('p', {
                                  className: 'text-xs text-slate-400 mt-1',
                                  children: [
                                    _.bultos != null ? `${_.bultos} bultos` : '',
                                    ((N = _.contexto) == null ? void 0 : N.pallets) != null
                                      ? ` · ${_.contexto.pallets} pallets`
                                      : '',
                                    (j = _.contexto) != null && j.tipo_contenedor
                                      ? ` · ${_.contexto.tipo_contenedor}`
                                      : ''
                                  ]
                                })
                            ]
                          },
                          _.id
                        );
                      })
                    })
          ]
        });
  },
  Xe = ({ label: s, value: d, tone: l }) => {
    const c = {
      slate: 'bg-white text-slate-800 border-slate-200',
      amber: 'bg-amber-50 text-amber-700 border-amber-200',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return e.jsxs('div', {
      className: `rounded-xl border px-3 py-2 ${c[l] || c.slate}`,
      children: [
        e.jsx('p', { className: 'text-lg font-black leading-none', children: d }),
        e.jsx('p', {
          className: 'mt-1 text-[9px] font-black uppercase tracking-widest opacity-70',
          children: s
        })
      ]
    });
  },
  It = ({ onClose: s }) => {
    const d = Fa(),
      [l, c] = f.useState(''),
      [E, h] = f.useState(!1),
      [t, g] = f.useState([]),
      [u, w] = f.useState([]),
      [p, O] = f.useState(''),
      [x, L] = f.useState('NORMAL'),
      v = f.useCallback(async () => {
        h(!0);
        try {
          g(await Ws(l, !1));
        } catch (a) {
          S.error(`Error buscando stock: ${a.message}`);
        } finally {
          h(!1);
        }
      }, [l]),
      b = (a) => `${a.codigo_producto}|${a.partida || ''}|${a.ubicacion || ''}`,
      z = (a) => ({
        _key: b(a),
        codigo_producto: a.codigo_producto,
        producto: a.producto || '',
        ubicacion: a.ubicacion || '',
        partida: a.partida || '',
        cantidad: Number(a.disponible) || 0,
        unidad_medida: a.unidad_medida || 'UN',
        tipo: a.tipo || 'NO_PERECIBLE',
        fecha_vencimiento: a.fecha_vencimiento || null,
        semaforo: a.semaforo || 'NA'
      }),
      P = (a) => {
        const m = b(a);
        if (u.some((n) => n._key === m)) {
          S.info('Ese SKU ya está en la asignación');
          return;
        }
        w((n) => [...n, z(a)]);
      },
      M = (a) => w((m) => m.filter((n) => n._key !== a)),
      R = (a) => {
        const m = b(a);
        u.some((n) => n._key === m) ? M(m) : P(a);
      },
      _ = () => {
        if (t.every((m) => u.some((n) => n._key === b(m)))) {
          const m = new Set(t.map(b));
          w((n) => n.filter((N) => !m.has(N._key)));
          return;
        }
        w((m) => {
          const n = new Set(m.map((j) => j._key)),
            N = t.map(z).filter((j) => (n.has(j._key) ? !1 : (n.add(j._key), !0)));
          return [...m, ...N];
        });
      },
      o = async () => {
        if (u.length === 0) {
          S.error('Elige al menos un SKU');
          return;
        }
        try {
          const a = u.map(({ _key: m, ...n }) => n);
          (await d.mutateAsync({ skus: a, motivo: p, prioridad: x }),
            S.success(`${a.length} SKU(s) asignados a Calidad`),
            s());
        } catch (a) {
          S.error(`No se pudo asignar: ${a.message}`);
        }
      };
    return e.jsx('div', {
      className: 'fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-3',
      onClick: s,
      children: e.jsxs('div', {
        className:
          'bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col',
        onClick: (a) => a.stopPropagation(),
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between p-5 border-b border-slate-100',
            children: [
              e.jsxs('h3', {
                className: 'font-black text-slate-900 flex items-center gap-2',
                children: [
                  e.jsx(as, { size: 18, className: 'text-emerald-600' }),
                  ' Asignar SKUs a Calidad'
                ]
              }),
              e.jsx('button', {
                onClick: s,
                className: 'p-2 rounded-lg hover:bg-slate-100 text-slate-400',
                children: e.jsx($e, { size: 18 })
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
                      e.jsx(ge, { size: 16, className: 'text-slate-400' }),
                      e.jsx('input', {
                        value: l,
                        onChange: (a) => c(a.target.value),
                        onKeyDown: (a) => a.key === 'Enter' && v(),
                        placeholder: 'Buscar por SKU, descripción o ubicación…',
                        className: 'flex-1 text-sm outline-none bg-transparent'
                      })
                    ]
                  }),
                  e.jsxs('button', {
                    onClick: v,
                    disabled: E,
                    className:
                      'px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 disabled:opacity-50',
                    children: [
                      E
                        ? e.jsx(pe, { size: 16, className: 'animate-spin' })
                        : e.jsx(ge, { size: 16 }),
                      ' ',
                      'Buscar'
                    ]
                  })
                ]
              }),
              t.length > 0 &&
                e.jsxs('div', {
                  className: 'border border-slate-100 rounded-xl max-h-60 overflow-y-auto',
                  children: [
                    e.jsxs('label', {
                      className:
                        'sticky top-0 z-10 flex cursor-pointer items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600',
                      children: [
                        e.jsx('input', {
                          type: 'checkbox',
                          checked: t.every((a) => u.some((m) => m._key === b(a))),
                          onChange: _,
                          className: 'h-4 w-4 accent-emerald-600'
                        }),
                        'Seleccionar todos los resultados (',
                        t.length,
                        ')'
                      ]
                    }),
                    t.map((a, m) =>
                      e.jsxs(
                        'label',
                        {
                          className:
                            'flex w-full cursor-pointer items-center gap-3 border-b border-slate-50 px-3 py-2 text-left hover:bg-emerald-50/50',
                          children: [
                            e.jsx('input', {
                              type: 'checkbox',
                              checked: u.some((n) => n._key === b(a)),
                              onChange: () => R(a),
                              className: 'h-4 w-4 shrink-0 accent-emerald-600'
                            }),
                            e.jsxs('span', {
                              className: 'min-w-0',
                              children: [
                                e.jsxs('span', {
                                  className: 'font-bold text-sm text-slate-800 truncate block',
                                  children: [a.codigo_producto, ' · ', a.producto]
                                }),
                                e.jsxs('span', {
                                  className: 'text-xs text-slate-400',
                                  children: [
                                    a.ubicacion || 's/ubic',
                                    ' · ',
                                    a.partida || 's/partida',
                                    ' · ',
                                    a.disponible,
                                    ' ',
                                    a.unidad_medida
                                  ]
                                })
                              ]
                            })
                          ]
                        },
                        m
                      )
                    )
                  ]
                }),
              e.jsxs('div', {
                children: [
                  e.jsxs('p', {
                    className:
                      'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5',
                    children: ['SKUs a asignar (', u.length, ')']
                  }),
                  u.length === 0
                    ? e.jsx('p', {
                        className: 'text-xs text-slate-400',
                        children: 'Busca y agrega los SKUs que Calidad debe revisar.'
                      })
                    : e.jsx('div', {
                        className: 'space-y-1.5',
                        children: u.map((a) =>
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
                                      children: [a.codigo_producto, ' · ', a.producto]
                                    }),
                                    e.jsxs('span', {
                                      className: 'text-xs text-slate-400',
                                      children: [
                                        a.ubicacion || 's/ubic',
                                        ' · ',
                                        a.partida || 's/partida',
                                        ' · ',
                                        a.cantidad,
                                        ' ',
                                        a.unidad_medida
                                      ]
                                    })
                                  ]
                                }),
                                e.jsx('button', {
                                  onClick: () => M(a._key),
                                  className:
                                    'p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 shrink-0',
                                  children: e.jsx(he, { size: 15 })
                                })
                              ]
                            },
                            a._key
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
                        onChange: (a) => O(a.target.value),
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
                        value: x,
                        onChange: (a) => L(a.target.value),
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
                onClick: o,
                disabled: d.isPending || u.length === 0,
                className:
                  'px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-40',
                children: [
                  d.isPending
                    ? e.jsx(pe, { size: 16, className: 'animate-spin' })
                    : e.jsx(as, { size: 16 }),
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
  Dt = ({ canAssign: s, canManageQuality: d, onGenerarInforme: l }) => {
    const { user: c } = ye(),
      E = (c == null ? void 0 : c.rol) === 'ADMIN' || (c == null ? void 0 : c.es_admin_delegado),
      { data: h = [], isLoading: t } = $a(),
      g = Ta(),
      u = La(),
      [w, p] = f.useState(!1),
      O = async (v) => {
        if (confirm('¿Anular esta asignación? No se podrá revertir.'))
          try {
            (await g.mutateAsync(v.id), S.success('Asignación anulada'));
          } catch (b) {
            S.error(`No se pudo anular: ${b.message}`);
          }
      },
      x = async (v) => {
        if (confirm('¿Eliminar esta asignación definitivamente? Esta acción no se puede deshacer.'))
          try {
            (await u.mutateAsync(v.id), S.success('Asignación eliminada'));
          } catch (b) {
            S.error(`No se pudo eliminar: ${b.message}`);
          }
      },
      L = h.filter((v) => v.estado === 'PENDIENTE' || v.estado === 'EN_PROCESO').length;
    return e.jsxs('div', {
      className: 'mb-6',
      children: [
        e.jsxs('div', {
          className: 'flex items-center justify-between gap-3 mb-3',
          children: [
            e.jsxs('h3', {
              className: 'text-sm font-black text-slate-700 flex items-center gap-2',
              children: [
                e.jsx(ls, { size: 16, className: 'text-emerald-500' }),
                ' Revisiones asignadas por Inventario',
                L > 0 &&
                  e.jsxs('span', {
                    className:
                      'text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700',
                    children: [L, ' pendiente(s)']
                  })
              ]
            }),
            s &&
              e.jsxs('button', {
                onClick: () => p(!0),
                className:
                  'px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 hover:bg-slate-800',
                children: [e.jsx(as, { size: 16 }), ' Asignar SKUs a Calidad']
              })
          ]
        }),
        t
          ? e.jsx('div', {
              className: 'flex justify-center py-8',
              children: e.jsx(pe, { className: 'animate-spin text-emerald-500', size: 26 })
            })
          : h.length === 0
            ? e.jsxs('div', {
                className:
                  'bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center',
                children: [
                  e.jsx(ua, { size: 30, className: 'text-slate-200 mx-auto mb-2' }),
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
                children: h.map((v) => {
                  const b = Pa[v.estado] || {},
                    z = Array.isArray(v.skus) ? v.skus : [],
                    P = v.estado === 'PENDIENTE' || v.estado === 'EN_PROCESO',
                    M =
                      P &&
                      v.locked_by &&
                      v.locked_at &&
                      Date.now() - new Date(v.locked_at).getTime() < 15 * 60 * 1e3,
                    R = M && v.locked_by !== (c == null ? void 0 : c.id);
                  return e.jsxs(
                    'div',
                    {
                      className: `bg-white rounded-2xl border p-4 ${P ? 'border-amber-200' : 'border-slate-200'}`,
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center justify-between gap-2 mb-2',
                          children: [
                            e.jsx('span', {
                              className: `text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${b.cls}`,
                              children: b.label || v.estado
                            }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-1.5',
                              children: [
                                v.prioridad === 'URGENTE' &&
                                  v.estado !== 'RESUELTA' &&
                                  e.jsxs('span', {
                                    className:
                                      'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-rose-100 text-rose-700 border-rose-200 flex items-center gap-1',
                                    children: [e.jsx(fe, { size: 11 }), ' Urgente']
                                  }),
                                E &&
                                  e.jsx('button', {
                                    onClick: () => x(v),
                                    title: 'Eliminar (admin)',
                                    className:
                                      'p-1.5 rounded-lg text-slate-300 hover:bg-rose-100 hover:text-rose-600',
                                    children: e.jsx(he, { size: 14 })
                                  })
                              ]
                            })
                          ]
                        }),
                        e.jsxs('p', {
                          className: 'text-sm font-black text-slate-800',
                          children: [z.length, ' SKU(s)']
                        }),
                        e.jsxs('p', {
                          className: 'text-xs text-slate-500 line-clamp-2 mt-0.5',
                          children: [
                            z
                              .slice(0, 3)
                              .map((_) => _.codigo_producto)
                              .join(', '),
                            z.length > 3 ? '…' : ''
                          ]
                        }),
                        v.motivo &&
                          e.jsxs('p', {
                            className: 'text-xs text-slate-400 mt-1 italic',
                            children: ['“', v.motivo, '”']
                          }),
                        e.jsxs('p', {
                          className: 'text-[11px] text-slate-400 mt-2',
                          children: [
                            v.asignado_nombre ? `Por ${v.asignado_nombre}` : 'Inventario',
                            ' ·',
                            ' ',
                            v.created_at ? new Date(v.created_at).toLocaleDateString('es-CL') : ''
                          ]
                        }),
                        M &&
                          e.jsxs('div', {
                            className: `mt-2 rounded-lg border px-2.5 py-2 text-[11px] font-bold ${R ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`,
                            children: [
                              '🔒 ',
                              R ? 'En proceso por' : 'Tarea tomada por',
                              ' ',
                              v.locked_by_name || 'otro usuario',
                              ' desde las',
                              ' ',
                              new Date(v.locked_at).toLocaleTimeString('es-CL', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            ]
                          }),
                        P &&
                          e.jsxs('div', {
                            className: 'flex flex-wrap gap-2 mt-3',
                            children: [
                              d &&
                                e.jsxs('button', {
                                  onClick: () => l(v),
                                  title: R ? 'El sistema verificará el bloqueo antes de abrir' : '',
                                  className: `flex-1 px-3 py-2 rounded-xl text-white font-black text-xs flex items-center justify-center gap-1.5 ${R ? 'bg-slate-500 hover:bg-slate-600' : 'bg-emerald-600 hover:bg-emerald-700'}`,
                                  children: [
                                    e.jsx(De, { size: 14 }),
                                    ' Generar informe / dictamen ',
                                    e.jsx(pa, { size: 14 })
                                  ]
                                }),
                              s &&
                                e.jsx('button', {
                                  onClick: () => O(v),
                                  title: 'Anular',
                                  className:
                                    'px-3 py-2 rounded-xl border border-slate-200 text-slate-500 font-black text-xs flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200',
                                  children: e.jsx(Fs, { size: 14 })
                                })
                            ]
                          }),
                        v.estado === 'RESUELTA' &&
                          e.jsxs('p', {
                            className:
                              'text-[11px] text-emerald-600 font-bold mt-3 flex items-center gap-1',
                            children: [
                              e.jsx(De, { size: 12 }),
                              ' Resuelta',
                              v.resuelto_nombre ? ` por ${v.resuelto_nombre}` : ''
                            ]
                          })
                      ]
                    },
                    v.id
                  );
                })
              }),
        w && e.jsx(It, { onClose: () => p(!1) })
      ]
    });
  },
  zt = ({ onClose: s, onCreated: d }) => {
    var ae, me;
    const l = Ga(),
      [c, E] = f.useState(''),
      [h, t] = f.useState(''),
      [g, u] = f.useState(''),
      [w, p] = f.useState(''),
      [O, x] = f.useState([]),
      [L, v] = f.useState(!0),
      [b, z] = f.useState(''),
      [P, M] = f.useState(''),
      [R, _] = f.useState(!1),
      [o, a] = f.useState(!1),
      [m, n] = f.useState([]),
      [N, j] = f.useState([]),
      [A, Y] = f.useState(null),
      [J, F] = f.useState(!1),
      [W, Z] = f.useState(''),
      ne = f.useRef(0),
      xe = f.useRef('');
    f.useEffect(() => {
      let I = !0;
      return (
        v(!0),
        ht()
          .then((Q) => {
            I && x((Q == null ? void 0 : Q.transportistas) || []);
          })
          .catch((Q) => {
            I && S.error(`No se pudo cargar el catálogo de transportistas: ${Q.message}`);
          })
          .finally(() => {
            I && v(!1);
          }),
        () => {
          I = !1;
        }
      );
    }, []);
    const oe = f.useMemo(() => (w && !O.includes(w) ? [w, ...O] : O), [w, O]),
      D = f.useCallback(
        async ({ silent: I = !1, force: Q = !1 } = {}) => {
          if (!c.trim()) {
            I || S.error('Escribe primero el número de N.V.');
            return;
          }
          const ee = c.trim();
          if (!Q && xe.current === ee) return;
          const de = ++ne.current;
          (F(!0), Z(''));
          try {
            const te = await bt(ee);
            if (de !== ne.current) return;
            if (((xe.current = ee), !te)) {
              (Y(null),
                t(''),
                Z(`La N.V. ${ee} no existe en el Panel PTM.`),
                I || S.error(`La N.V. ${ee} no fue encontrada.`));
              return;
            }
            (Y(te),
              t(te.cliente || ''),
              u(te.guia || ''),
              p(te.transportista || ''),
              z(te.bultos || ''),
              te.cliente || Z(`La N.V. ${te.nv} no tiene un cliente asociado.`),
              I || S.success(`N.V ${te.nv} encontrada: cliente cargado automáticamente`));
          } catch (te) {
            if (de !== ne.current) return;
            (Y(null),
              t(''),
              Z(`No se pudo consultar la N.V.: ${te.message}`),
              I || S.error(`No se pudo consultar el Panel PTM: ${te.message}`));
          } finally {
            de === ne.current && F(!1);
          }
        },
        [c]
      );
    f.useEffect(() => {
      if (c.length < 3) return;
      const I = window.setTimeout(() => D({ silent: !0 }), 650);
      return () => window.clearTimeout(I);
    }, [c, D]);
    const V = (I) => {
        const Q = String(I || '').replace(/[^0-9]/g, '');
        Q !== c &&
          ((ne.current += 1),
          (xe.current = ''),
          E(Q),
          Y(null),
          t(''),
          u(''),
          p(''),
          z(''),
          Z(''),
          F(!1));
      },
      se = (I) => {
        const Q = new Map();
        return (
          (I || []).forEach((ee) => {
            const de = `${ee.codigo_producto}|${ee.partida || ''}`,
              te = Q.get(de);
            te
              ? (te.disponible = Number(te.disponible || 0) + (Number(ee.disponible) || 0))
              : Q.set(de, { ...ee, ubicacion: '', disponible: Number(ee.disponible) || 0 });
          }),
          [...Q.values()]
        );
      },
      X = f.useCallback(async () => {
        _(!0);
        try {
          n(se(await Va(P)));
        } catch (I) {
          S.error(`Error buscando stock: ${I.message}`);
        } finally {
          (a(!0), _(!1));
        }
      }, [P]),
      y = (I) => `${I.codigo_producto}|${I.partida || ''}`,
      G = (I) => {
        const Q = y(I);
        if (N.some((ee) => ee._key === Q)) {
          S.info('Ese SKU ya está agregado');
          return;
        }
        j((ee) => [
          ...ee,
          {
            _key: Q,
            codigo_producto: I.codigo_producto,
            producto: I.producto || '',
            ubicacion: '',
            partida: I.partida || '',
            cantidad: Number(I.disponible) > 0 ? Number(I.disponible) : 1,
            unidad_medida: I.unidad_medida || 'UN'
          }
        ]);
      },
      q = (I) => j((Q) => Q.filter((ee) => ee._key !== I)),
      le = async () => {
        if (!c.trim()) {
          S.error('Escribe la N.V.');
          return;
        }
        if (!A || !h.trim()) {
          S.error('Primero valida la N.V. para cargar el cliente desde el Panel PTM.');
          return;
        }
        if (N.length === 0) {
          S.error('Agrega al menos un SKU');
          return;
        }
        try {
          const I = N.map(({ _key: ee, ...de }) => de),
            Q = await l.mutateAsync({
              nv: c.trim(),
              skus: I,
              cliente: h.trim() || null,
              guia: g.trim() || null,
              transportista: w.trim() || null,
              bultos: b ? Number(b) : null
            });
          (S.success('Certificación de salida creada'), d(Q == null ? void 0 : Q.id));
        } catch (I) {
          S.error(`No se pudo crear: ${I.message}`);
        }
      };
    return e.jsx('div', {
      className:
        'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-2 backdrop-blur-sm sm:p-6',
      onClick: s,
      children: e.jsxs('div', {
        className:
          'flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.35)]',
        onClick: (I) => I.stopPropagation(),
        children: [
          e.jsxs('header', {
            className:
              'relative overflow-hidden border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-indigo-50 px-5 py-5 sm:px-7',
            children: [
              e.jsx('div', {
                className:
                  'absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-200/30 blur-3xl'
              }),
              e.jsxs('div', {
                className: 'relative flex items-start justify-between gap-4',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-3.5',
                    children: [
                      e.jsx('div', {
                        className:
                          'grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200',
                        children: e.jsx(Ms, { size: 23 })
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('div', {
                            className: 'mb-1 flex items-center gap-2',
                            children: e.jsx('span', {
                              className:
                                'rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700',
                              children: 'Calidad · Hito 3'
                            })
                          }),
                          e.jsx('h3', {
                            className:
                              'text-lg font-black tracking-tight text-slate-950 sm:text-xl',
                            children: 'Nueva certificación de salida'
                          }),
                          e.jsx('p', {
                            className: 'mt-0.5 text-xs text-slate-500',
                            children: 'Valida la N.V., confirma el despacho y agrega sus productos.'
                          })
                        ]
                      })
                    ]
                  }),
                  e.jsx('button', {
                    onClick: s,
                    'aria-label': 'Cerrar',
                    className:
                      'grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white/80 text-slate-400 shadow-sm transition hover:border-slate-300 hover:text-slate-700',
                    children: e.jsx($e, { size: 18 })
                  })
                ]
              })
            ]
          }),
          e.jsxs('div', {
            className: 'flex-1 space-y-4 overflow-y-auto bg-slate-50/80 p-4 sm:p-6',
            children: [
              e.jsxs('section', {
                className: 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5',
                children: [
                  e.jsxs('div', {
                    className: 'mb-4 flex items-center gap-3',
                    children: [
                      e.jsx('span', {
                        className:
                          'grid h-8 w-8 place-items-center rounded-xl bg-slate-950 text-xs font-black text-white',
                        children: '01'
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('h4', {
                            className: 'text-sm font-black text-slate-900',
                            children: 'Identificación del despacho'
                          }),
                          e.jsx('p', {
                            className: 'text-[11px] text-slate-400',
                            children: 'El cliente se obtiene exclusivamente desde el Panel PTM.'
                          })
                        ]
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    className: 'grid gap-4 lg:grid-cols-12',
                    children: [
                      e.jsxs('div', {
                        className: 'lg:col-span-5',
                        children: [
                          e.jsxs('label', {
                            className:
                              'mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500',
                            children: [
                              'Número de N.V. ',
                              e.jsx('span', { className: 'text-rose-500', children: '*' })
                            ]
                          }),
                          e.jsxs('div', {
                            className: `flex h-12 items-center overflow-hidden rounded-xl border bg-white transition ${W ? 'border-rose-300 ring-4 ring-rose-50' : A ? 'border-emerald-300 ring-4 ring-emerald-50' : 'border-slate-200 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50'}`,
                            children: [
                              e.jsx(ga, { size: 17, className: 'ml-3 shrink-0 text-slate-400' }),
                              e.jsx('input', {
                                value: c,
                                onChange: (I) => V(I.target.value),
                                onKeyDown: (I) => I.key === 'Enter' && D({ silent: !1, force: !0 }),
                                inputMode: 'numeric',
                                placeholder: 'Ej. 97621',
                                className:
                                  'min-w-0 flex-1 bg-transparent px-2 text-base font-black text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-300'
                              }),
                              e.jsx('button', {
                                onClick: () => D({ silent: !1, force: !0 }),
                                disabled: J || !c.trim(),
                                title: 'Validar N.V. en el Panel PTM',
                                className:
                                  'mr-1 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40',
                                children: J
                                  ? e.jsx(pe, { size: 17, className: 'animate-spin' })
                                  : A
                                    ? e.jsx(Se, { size: 17 })
                                    : e.jsx(ge, { size: 17 })
                              })
                            ]
                          }),
                          e.jsx('div', {
                            className: 'mt-1.5 min-h-4 text-[10px] font-semibold',
                            children: J
                              ? e.jsx('span', {
                                  className: 'text-indigo-600',
                                  children: 'Buscando N.V. y cargando cliente…'
                                })
                              : W
                                ? e.jsx('span', { className: 'text-rose-600', children: W })
                                : A
                                  ? e.jsx('span', {
                                      className: 'text-emerald-600',
                                      children: 'N.V. validada correctamente'
                                    })
                                  : e.jsx('span', {
                                      className: 'text-slate-400',
                                      children: 'La consulta se realiza automáticamente.'
                                    })
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'lg:col-span-7',
                        children: [
                          e.jsxs('div', {
                            className: 'mb-1.5 flex items-center justify-between gap-2',
                            children: [
                              e.jsx('label', {
                                className:
                                  'text-[10px] font-black uppercase tracking-[0.16em] text-slate-500',
                                children: 'Cliente'
                              }),
                              e.jsxs('span', {
                                className:
                                  'flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-indigo-500',
                                children: [e.jsx(Le, { size: 11 }), ' Automático · no editable']
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: `flex h-12 items-center gap-3 rounded-xl border px-3.5 ${h ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-slate-100/70'}`,
                            title: h || 'Se cargará al validar la N.V.',
                            children: [
                              e.jsx(fa, {
                                size: 18,
                                className: h
                                  ? 'shrink-0 text-emerald-600'
                                  : 'shrink-0 text-slate-400'
                              }),
                              e.jsx('span', {
                                className: `truncate text-sm font-bold ${h ? 'text-slate-800' : 'text-slate-400'}`,
                                children: h || 'Se cargará desde la N.V. seleccionada'
                              }),
                              h &&
                                e.jsx(He, {
                                  size: 17,
                                  className: 'ml-auto shrink-0 text-emerald-600'
                                })
                            ]
                          }),
                          e.jsx('p', {
                            className: 'mt-1.5 text-[10px] text-slate-400',
                            children: 'Fuente oficial: Panel PTM. No admite ingreso manual.'
                          })
                        ]
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    className: 'mt-4 grid gap-3 border-t border-slate-100 pt-4 md:grid-cols-3',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx('label', {
                            className:
                              'mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500',
                            children: 'Guía'
                          }),
                          e.jsx('input', {
                            value: g,
                            onChange: (I) => u(I.target.value),
                            placeholder: 'Sin guía',
                            className:
                              'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50'
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('label', {
                            className:
                              'mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500',
                            children: 'Bultos'
                          }),
                          e.jsx('input', {
                            value: b,
                            onChange: (I) => z(I.target.value.replace(/[^0-9]/g, '')),
                            placeholder: '0',
                            inputMode: 'numeric',
                            className:
                              'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50'
                          })
                        ]
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('label', {
                            className:
                              'mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500',
                            children: 'Transportista'
                          }),
                          e.jsxs('select', {
                            value: w,
                            onChange: (I) => p(I.target.value),
                            disabled: L,
                            className:
                              'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 disabled:bg-slate-100 disabled:text-slate-400',
                            children: [
                              e.jsx('option', {
                                value: '',
                                children: L ? 'Cargando…' : '— Seleccionar —'
                              }),
                              oe.map((I) => e.jsx('option', { value: I, children: I }, I))
                            ]
                          }),
                          e.jsx('p', {
                            className: 'mt-1 text-[9px] text-slate-400',
                            children: 'Mismo catálogo de Ingresar N.V.'
                          })
                        ]
                      })
                    ]
                  }),
                  A &&
                    e.jsxs('div', {
                      className:
                        'mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-slate-50 p-3.5',
                      children: [
                        e.jsxs('div', {
                          className: 'mb-3 flex flex-wrap items-center justify-between gap-2',
                          children: [
                            e.jsxs('span', {
                              className:
                                'flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700',
                              children: [
                                e.jsx(He, { size: 15 }),
                                ' Datos sincronizados con Panel PTM'
                              ]
                            }),
                            e.jsxs('span', {
                              className: 'flex items-center gap-1.5',
                              children: [
                                A.urgente &&
                                  e.jsx('span', {
                                    className:
                                      'rounded-md border border-rose-200 bg-rose-100 px-2 py-1 text-[9px] font-black text-rose-700',
                                    children: 'URGENTE'
                                  }),
                                A.estado &&
                                  e.jsx('span', {
                                    className:
                                      'rounded-md border border-indigo-200 bg-white px-2 py-1 text-[9px] font-black text-indigo-700',
                                    children: A.estado
                                  })
                              ]
                            })
                          ]
                        }),
                        e.jsx('div', {
                          className: 'grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4',
                          children: [
                            ['Vendedor', A.vendedor],
                            [
                              'Compromiso',
                              (ae = A.fechaCompromiso) == null
                                ? void 0
                                : ae.split('-').reverse().join('-')
                            ],
                            ['División', A.division],
                            ['Centro de costo', A.centroCosto],
                            ['Factura', A.factura],
                            ['N° envío', A.numeroEnvio],
                            ['Tipo despacho', A.tipoDespacho],
                            [
                              'Fecha despacho',
                              (me = A.fechaDespacho) == null
                                ? void 0
                                : me.split('-').reverse().join('-')
                            ]
                          ]
                            .filter(([, I]) => I)
                            .map(([I, Q]) =>
                              e.jsxs(
                                'div',
                                {
                                  className:
                                    'min-w-0 rounded-xl border border-white bg-white/70 px-2.5 py-2',
                                  children: [
                                    e.jsx('span', {
                                      className:
                                        'block text-[9px] font-black uppercase tracking-wide text-slate-400',
                                      children: I
                                    }),
                                    e.jsx('span', {
                                      className: 'mt-0.5 block truncate font-bold text-slate-700',
                                      title: Q,
                                      children: Q
                                    })
                                  ]
                                },
                                I
                              )
                            )
                        })
                      ]
                    })
                ]
              }),
              e.jsxs('section', {
                className: 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5',
                children: [
                  e.jsxs('div', {
                    className: 'mb-4 flex items-center justify-between gap-3',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center gap-3',
                        children: [
                          e.jsx('span', {
                            className:
                              'grid h-8 w-8 place-items-center rounded-xl bg-slate-950 text-xs font-black text-white',
                            children: '02'
                          }),
                          e.jsxs('div', {
                            children: [
                              e.jsx('h4', {
                                className: 'text-sm font-black text-slate-900',
                                children: 'Productos del despacho'
                              }),
                              e.jsx('p', {
                                className: 'text-[11px] text-slate-400',
                                children: 'Busca por código o descripción, incluso SKU antiguos.'
                              })
                            ]
                          })
                        ]
                      }),
                      e.jsxs('span', {
                        className:
                          'rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-700',
                        children: [N.length, ' seleccionado', N.length === 1 ? '' : 's']
                      })
                    ]
                  }),
                  e.jsxs('div', {
                    className: 'flex flex-col gap-2 sm:flex-row',
                    children: [
                      e.jsxs('div', {
                        className:
                          'flex h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50',
                        children: [
                          e.jsx(ge, { size: 17, className: 'shrink-0 text-slate-400' }),
                          e.jsx('input', {
                            value: P,
                            onChange: (I) => M(I.target.value),
                            onKeyDown: (I) => I.key === 'Enter' && X(),
                            placeholder: 'SKU actual o antiguo…',
                            className:
                              'min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400'
                          })
                        ]
                      }),
                      e.jsxs('button', {
                        onClick: X,
                        disabled: R,
                        className:
                          'flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50',
                        children: [
                          R
                            ? e.jsx(pe, { size: 16, className: 'animate-spin' })
                            : e.jsx(ge, { size: 16 }),
                          'Buscar producto'
                        ]
                      })
                    ]
                  }),
                  m.length > 0 &&
                    e.jsx('div', {
                      className:
                        'mt-3 max-h-52 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white',
                      children: m.map((I, Q) =>
                        e.jsxs(
                          'button',
                          {
                            onClick: () => G(I),
                            className:
                              'group flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition hover:bg-emerald-50/70',
                            children: [
                              e.jsxs('span', {
                                className: 'min-w-0',
                                children: [
                                  e.jsx('span', {
                                    className: 'block truncate text-sm font-black text-slate-800',
                                    children: I.codigo_producto
                                  }),
                                  e.jsx('span', {
                                    className: 'block truncate text-xs text-slate-500',
                                    children: I.producto
                                  }),
                                  e.jsxs('span', {
                                    className:
                                      'mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400',
                                    children: [
                                      e.jsx('span', { children: I.partida || 'Sin partida' }),
                                      e.jsx('span', { children: '·' }),
                                      e.jsxs('span', {
                                        children: [
                                          I.disponible,
                                          ' ',
                                          I.unidad_medida,
                                          ' disponibles'
                                        ]
                                      }),
                                      I.es_historico &&
                                        e.jsx('span', {
                                          className:
                                            'rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-bold text-amber-700',
                                          children: 'Histórico'
                                        })
                                    ]
                                  })
                                ]
                              }),
                              e.jsx('span', {
                                className:
                                  'grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white',
                                children: e.jsx(Ee, { size: 16 })
                              })
                            ]
                          },
                          `${I.codigo_producto}-${I.partida || ''}-${Q}`
                        )
                      )
                    }),
                  o &&
                    !R &&
                    m.length === 0 &&
                    e.jsxs('div', {
                      className:
                        'mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center',
                      children: [
                        e.jsx(Re, { size: 21, className: 'mx-auto mb-1.5 text-slate-300' }),
                        e.jsx('p', {
                          className: 'text-xs font-bold text-slate-500',
                          children: 'No encontramos productos para esa búsqueda.'
                        }),
                        e.jsx('p', {
                          className: 'mt-0.5 text-[10px] text-slate-400',
                          children: 'Verifica el código o prueba con parte de la descripción.'
                        })
                      ]
                    }),
                  e.jsx('div', {
                    className: 'mt-4 border-t border-slate-100 pt-4',
                    children:
                      N.length === 0
                        ? e.jsxs('div', {
                            className:
                              'rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-7 text-center',
                            children: [
                              e.jsx(is, { size: 25, className: 'mx-auto mb-2 text-slate-300' }),
                              e.jsx('p', {
                                className: 'text-xs font-black text-slate-600',
                                children: 'Aún no hay SKU en el despacho'
                              }),
                              e.jsx('p', {
                                className: 'mt-1 text-[10px] text-slate-400',
                                children: 'Busca un producto y presiona + para agregarlo.'
                              })
                            ]
                          })
                        : e.jsx('div', {
                            className: 'space-y-2',
                            children: N.map((I, Q) =>
                              e.jsxs(
                                'div',
                                {
                                  className:
                                    'flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:flex-row sm:items-center',
                                  children: [
                                    e.jsx('span', {
                                      className:
                                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-[11px] font-black text-slate-500 shadow-sm',
                                      children: Q + 1
                                    }),
                                    e.jsxs('span', {
                                      className: 'min-w-0 flex-1',
                                      children: [
                                        e.jsxs('span', {
                                          className:
                                            'block truncate text-sm font-black text-slate-800',
                                          children: [I.codigo_producto, ' · ', I.producto]
                                        }),
                                        e.jsxs('span', {
                                          className: 'text-[10px] text-slate-400',
                                          children: [
                                            I.partida || 'Sin partida',
                                            ' · ',
                                            I.unidad_medida
                                          ]
                                        })
                                      ]
                                    }),
                                    e.jsxs('label', {
                                      className:
                                        'flex items-center gap-2 text-[9px] font-black uppercase tracking-wide text-slate-500',
                                      children: [
                                        'Cantidad',
                                        e.jsx('input', {
                                          type: 'number',
                                          min: '1',
                                          step: '1',
                                          value: I.cantidad,
                                          onChange: (ee) => {
                                            const de = Math.max(1, Number(ee.target.value) || 1);
                                            j((te) =>
                                              te.map((Ne) =>
                                                Ne._key === I._key ? { ...Ne, cantidad: de } : Ne
                                              )
                                            );
                                          },
                                          className:
                                            'h-9 w-20 rounded-lg border border-slate-200 bg-white px-2 text-center text-sm font-bold text-slate-800 outline-none focus:border-emerald-400'
                                        })
                                      ]
                                    }),
                                    e.jsx('button', {
                                      onClick: () => q(I._key),
                                      'aria-label': `Quitar ${I.codigo_producto}`,
                                      className:
                                        'grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500 transition hover:bg-rose-100',
                                      children: e.jsx(he, { size: 15 })
                                    })
                                  ]
                                },
                                I._key
                              )
                            )
                          })
                  })
                ]
              })
            ]
          }),
          e.jsxs('footer', {
            className:
              'flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6',
            children: [
              e.jsxs('div', {
                className: 'flex flex-wrap items-center gap-2 text-[10px] font-bold',
                children: [
                  e.jsxs('span', {
                    className: `rounded-full px-2.5 py-1 ${A ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`,
                    children: [A ? '✓' : '1', ' N.V. validada']
                  }),
                  e.jsxs('span', {
                    className: `rounded-full px-2.5 py-1 ${h ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`,
                    children: [h ? '✓' : '2', ' Cliente cargado']
                  }),
                  e.jsxs('span', {
                    className: `rounded-full px-2.5 py-1 ${N.length ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`,
                    children: [N.length ? '✓' : '3', ' ', N.length, ' SKU']
                  })
                ]
              }),
              e.jsxs('div', {
                className: 'flex justify-end gap-2',
                children: [
                  e.jsx('button', {
                    onClick: s,
                    className:
                      'h-11 rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50',
                    children: 'Cancelar'
                  }),
                  e.jsxs('button', {
                    onClick: le,
                    disabled: l.isPending || !A || !h.trim() || N.length === 0,
                    className:
                      'flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200 disabled:shadow-none',
                    children: [
                      l.isPending
                        ? e.jsx(pe, { size: 16, className: 'animate-spin' })
                        : e.jsx(Le, { size: 16 }),
                      'Crear certificación'
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    });
  },
  $t = ({ tarea: s, onBack: d, canManage: l }) => {
    const c = Hs(),
      E = Ks(),
      h = s.estado === 'CONFORME' || s.estado === 'NO_CONFORME',
      t = h || !l,
      g = s.contexto || {},
      u = (C) => {
        const { _extras: $, ...H } = C || {};
        return { resp: H, extras: $ || {} };
      },
      [w, p] = f.useState(() => u(s.checklist).resp),
      [O, x] = f.useState(() => u(s.checklist).extras),
      [L, v] = f.useState(s.observaciones || ''),
      [b, z] = f.useState(s.disposicion || '');
    f.useEffect(() => {
      const { resp: C, extras: $ } = u(s.checklist);
      (p(C), x($), v(s.observaciones || ''), z(s.disposicion || ''));
    }, [s.id]);
    const P = (C, $) => p((H) => ({ ...H, [C]: { ...H[C], estado: $ } })),
      M = (C, $) => p((H) => ({ ...H, [C]: { ...H[C], nota: $ } })),
      R = (C, $) => p((H) => ({ ...H, [C]: { ...H[C], evidencia: $ } })),
      _ = (C, $) => x((H) => ({ ...H, [C]: $ })),
      {
        answeredAll: o,
        hasNo: a,
        faltan: m
      } = f.useMemo(() => {
        var H;
        let C = 0,
          $ = !1;
        for (const re of Ze) {
          const ie = (H = w[re.id]) == null ? void 0 : H.estado;
          (ie && C++, ie === 'NO' && ($ = !0));
        }
        return { answeredAll: C === Ze.length, hasNo: $, faltan: Ze.length - C };
      }, [w]),
      n = async (C) => {
        try {
          const $ = { tipo: 'SALIDA' };
          if (C === 'pdf') {
            const H = u(s.checklist).extras.evidencias || O.evidencias || [],
              re = [];
            for (const ie of H)
              try {
                const be = await cs(Pe, ie.path);
                if (!be) continue;
                const ue = await fetch(be).then((T) => (T.ok ? T.blob() : null));
                if (!ue || !/image\/(jpeg|png)/.test(ue.type)) continue;
                const i = await new Promise((T, B) => {
                  const r = new FileReader();
                  ((r.onload = () => T(r.result)), (r.onerror = B), r.readAsDataURL(ue));
                });
                re.push({ tipo: ie.tipo, dataUrl: i });
              } catch {}
            (($.evidenciasImg = re), await na(s, Ye, $));
          } else await ra(s, Ye, $);
        } catch ($) {
          S.error(`No se pudo generar el documento: ${$.message}`);
        }
      },
      N = async () => {
        if (
          confirm(
            '¿Firmar digitalmente este certificado de salida? Quedará sellado y verificable por folio/QR.'
          )
        )
          try {
            const C = await E.mutateAsync(s.id);
            S.success(`Documento firmado por ${(C == null ? void 0 : C.firmado_nombre) || ''}`);
          } catch (C) {
            S.error(`No se pudo firmar: ${C.message}`);
          }
      },
      j = (C = O) => ({ ...w, _extras: C }),
      A = async () => {
        try {
          (await c.mutateAsync({
            tareaId: s.id,
            checklist: j(),
            observaciones: L,
            disposicion: b,
            finalizar: !1
          }),
            S.success('Avance guardado'));
        } catch (C) {
          S.error(`No se pudo guardar: ${C.message}`);
        }
      },
      Y = async () => {
        if (!o) {
          S.error(`Faltan ${m} ítem(s) por responder`);
          return;
        }
        const C = a ? 'NO_CONFORME' : 'CONFORME';
        if (C === 'NO_CONFORME' && !b) {
          S.error('Selecciona la disposición antes de finalizar');
          return;
        }
        if (
          confirm(
            C === 'CONFORME'
              ? 'Todos los ítems conformes → se emitirá el CERTIFICADO DE CONFORMIDAD DE SALIDA (folio CERT-SAL-) y la tarea quedará bloqueada. ¿Continuar?'
              : `Hay ítems NO conformes → SALIDA NO CONFORME (folio ACTA-SAL-), disposición "${b}". No despachar hasta resolver. ¿Continuar?`
          )
        )
          try {
            const $ = await c.mutateAsync({
              tareaId: s.id,
              checklist: j(),
              observaciones: L,
              disposicion: b,
              finalizar: !0,
              resultado: C
            });
            C === 'CONFORME'
              ? (S.success(`Salida certificada ${($ == null ? void 0 : $.folio) || ''}`), d())
              : S.warning('Salida NO CONFORME. No despachar hasta resolver.');
          } catch ($) {
            S.error(`No se pudo finalizar: ${$.message}`);
          }
      },
      J = f.useRef(null),
      [F, W] = f.useState(!1),
      Z = typeof navigator < 'u' && navigator.maxTouchPoints > 0,
      [ne, xe] = f.useState(null),
      [oe, D] = f.useState(!1),
      [V, se] = f.useState({}),
      X = O.evidencias || [];
    f.useEffect(() => {
      let C = !0;
      return (
        ds(
          Pe,
          X.map(($) => $.path)
        ).then(($) => {
          C && se($);
        }),
        () => {
          C = !1;
        }
      );
    }, [JSON.stringify(X.map((C) => C.path))]);
    const y = (C, $ = 'galeria') => {
        var H;
        (xe(C), $ === 'camara' ? W(!0) : (H = J.current) == null || H.click());
      },
      G = async (C) => {
        var H;
        const $ = Array.from(C.target.files || []);
        if (((C.target.value = ''), !(!$.length || !ne))) {
          D(!0);
          try {
            const re = [];
            for (const ie of $) {
              if (!ie.type.startsWith('image/')) continue;
              const be = await ws(ie),
                ue = await Ha({ tareaId: s.id, tipo: ne, blob: be });
              re.push({ tipo: ne, path: ue, subido_en: new Date().toISOString() });
            }
            if (re.length) {
              const ie = { ...O, evidencias: [...X, ...re] };
              (x(ie),
                await c.mutateAsync({
                  tareaId: s.id,
                  checklist: j(ie),
                  observaciones: L,
                  disposicion: b,
                  finalizar: !1
                }),
                S.success(
                  re.length > 1 ? 'Fotos agregadas al certificado' : 'Foto agregada al certificado'
                ));
            }
          } catch (re) {
            S.error(
              (H = re == null ? void 0 : re.message) != null && H.includes('row-level security')
                ? 'No tienes permiso para subir fotos'
                : `Error al subir: ${re.message}`
            );
          } finally {
            (D(!1), xe(null));
          }
        }
      },
      q = async (C) => {
        if (confirm('¿Eliminar esta foto del certificado?'))
          try {
            await Js(C.path);
            const $ = { ...O, evidencias: X.filter((H) => H.path !== C.path) };
            (x($),
              await c.mutateAsync({
                tareaId: s.id,
                checklist: j($),
                observaciones: L,
                disposicion: b,
                finalizar: !1
              }),
              S.success('Foto eliminada'));
          } catch {
            S.error('No se pudo eliminar la foto');
          }
      },
      le = (C) =>
        x(($) => {
          const H = new Set($.riesgos || []);
          return C === 'NINGUNO'
            ? { ...$, riesgos: H.has('NINGUNO') ? [] : ['NINGUNO'] }
            : (H.delete('NINGUNO'), H.has(C) ? H.delete(C) : H.add(C), { ...$, riesgos: [...H] });
        }),
      ae = Number(O.bultosTotal ?? s.bultos) || 0,
      me = Array.isArray(O.bultosEtiquetas) ? O.bultosEtiquetas : [],
      I = (C) => {
        const $ = Array.from({ length: ae }, (H, re) => !!me[re]);
        (($[C] = !$[C]), _('bultosEtiquetas', $));
      },
      Q = O.pesos || {},
      ee = bs(Q.esperado, Q.registrado),
      de = h
        ? ke(s)
        : o
          ? a
            ? b === 'Despachar con salvedades (autorizado)'
              ? { ...Ue.NARANJA }
              : { ...Ue.ROJO }
            : { ...Ue.VERDE }
          : { ...Ue.PENDIENTE },
      te = ({ pid: C, val: $, icon: H, activeCls: re }) => {
        var be;
        const ie = ((be = w[C]) == null ? void 0 : be.estado) === $;
        return e.jsx('button', {
          type: 'button',
          disabled: t,
          onClick: () => P(C, $),
          className: `w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shrink-0
          ${ie ? re : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'} ${t ? 'opacity-60 cursor-default' : ''}`,
          children: H
        });
      },
      Ne = ze[s.estado] || {};
    return e.jsxs('div', {
      children: [
        e.jsxs('button', {
          onClick: d,
          className:
            'flex items-center gap-2 text-slate-500 font-bold text-sm mb-4 hover:text-slate-800',
          children: [e.jsx(Ie, { size: 18 }), ' Volver a la cola']
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
                  children: e.jsx(Qe, { size: 26 })
                }),
                e.jsxs('div', {
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-2 flex-wrap',
                      children: [
                        e.jsx('span', {
                          className: 'font-black text-slate-900',
                          children: s.proveedor || g.cliente || 'Sin cliente'
                        }),
                        e.jsx('span', {
                          className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${Ne.cls || ''}`,
                          children: Ne.label || s.estado
                        })
                      ]
                    }),
                    e.jsxs('p', {
                      className:
                        'text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-3 flex-wrap',
                      children: [
                        e.jsxs('span', { children: ['NV ', s.oc || g.nv || '—'] }),
                        e.jsxs('span', { children: ['Guía ', g.guia || '—'] }),
                        g.factura && e.jsxs('span', { children: ['Factura ', g.factura] }),
                        e.jsxs('span', {
                          className: 'flex items-center gap-1',
                          children: [e.jsx(Ls, { size: 12 }), ' ', s.fecha_recepcion || '—']
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
                      children: [e.jsx(Ps, { size: 15 }), ' PDF']
                    }),
                    e.jsxs('button', {
                      onClick: () => n('word'),
                      className:
                        'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                      children: [e.jsx(De, { size: 15 }), ' Word']
                    })
                  ]
                })
              ]
            })
          ]
        }),
        e.jsxs('div', {
          className: `rounded-2xl border-2 p-4 mb-4 flex items-center justify-between gap-3 flex-wrap ${de.cls}`,
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsx('span', { className: 'text-3xl leading-none', children: de.emoji }),
                e.jsxs('div', {
                  children: [
                    e.jsx('p', {
                      className: 'font-black text-lg tracking-tight',
                      children: de.label
                    }),
                    e.jsx('p', {
                      className: 'text-xs opacity-80 font-bold',
                      children: h
                        ? s.disposicion
                          ? `Disposición: ${s.disposicion}`
                          : `Folio ${s.folio || '—'}`
                        : m > 0
                          ? `${m} ítem(s) del checklist por responder`
                          : 'Checklist completo — listo para finalizar'
                    })
                  ]
                })
              ]
            }),
            ee &&
              e.jsxs('span', {
                className: `text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${ee === 'CONFORME' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`,
                children: ['Peso ', ee]
              })
          ]
        }),
        Array.isArray(g.skus) &&
          g.skus.length > 0 &&
          e.jsxs('div', {
            className: 'bg-white rounded-2xl border border-slate-200 p-5 mb-4',
            children: [
              e.jsxs('h3', {
                className: 'text-sm font-black text-slate-800 mb-3 flex items-center gap-2',
                children: [
                  e.jsx(Re, { size: 16, className: 'text-slate-400' }),
                  ' SKUs del despacho (',
                  g.skus.length,
                  ')'
                ]
              }),
              e.jsx('div', {
                className: 'space-y-1.5',
                children: g.skus.map((C, $) =>
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
                              children: C.codigo_producto
                            }),
                            ' ',
                            e.jsxs('span', {
                              className: 'text-slate-500',
                              children: ['· ', C.producto]
                            })
                          ]
                        }),
                        e.jsxs('span', {
                          className: 'text-xs text-slate-400 shrink-0',
                          children: [
                            C.ubicacion || '—',
                            ' · ',
                            C.cantidad,
                            ' ',
                            C.unidad_medida || ''
                          ]
                        })
                      ]
                    },
                    $
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
                e.jsx(He, { size: 22, className: 'text-emerald-600 shrink-0 mt-0.5' }),
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
          : h && l
            ? e.jsxs('div', {
                className:
                  'bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3',
                children: [
                  e.jsxs('div', {
                    className: 'text-sm text-slate-600 flex items-center gap-2',
                    children: [
                      e.jsx(Ke, { size: 18, className: 'text-slate-400' }),
                      ' Documento sin firmar.'
                    ]
                  }),
                  e.jsxs('button', {
                    onClick: N,
                    disabled: E.isPending,
                    className:
                      'px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50',
                    children: [e.jsx(Ke, { size: 16 }), ' Firmar digitalmente']
                  })
                ]
              })
            : null,
        e.jsxs('div', {
          className: 'space-y-4',
          children: [
            Ye.map((C) =>
              e.jsxs(
                'div',
                {
                  className: 'bg-white rounded-2xl border border-slate-200 p-5',
                  children: [
                    e.jsx('h3', {
                      className: 'text-sm font-black text-slate-800 mb-3',
                      children: C.titulo
                    }),
                    e.jsx('div', {
                      className: 'space-y-2.5',
                      children: C.params.map(($) => {
                        var H, re, ie, be, ue, i, T;
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
                                    children: $.label
                                  }),
                                  ((H = w[$.id]) == null ? void 0 : H.estado) &&
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
                                            ((re = w[$.id]) == null ? void 0 : re.evidencia) || '',
                                          disabled: t,
                                          onChange: (B) => R($.id, B.target.value),
                                          className: `px-2 py-1 rounded-lg border text-[11px] font-bold ${(ie = w[$.id]) != null && ie.evidencia ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 text-slate-400'}`,
                                          children: [
                                            e.jsx('option', {
                                              value: '',
                                              children: '— cómo se verificó —'
                                            }),
                                            qs.map((B) =>
                                              e.jsx('option', { value: B, children: B }, B)
                                            )
                                          ]
                                        })
                                      ]
                                    }),
                                  ((be = w[$.id]) == null ? void 0 : be.estado) === 'NO' &&
                                    e.jsx('input', {
                                      value: ((ue = w[$.id]) == null ? void 0 : ue.nota) || '',
                                      disabled: t,
                                      onChange: (B) => M($.id, B.target.value),
                                      placeholder: 'Detalle de la no conformidad…',
                                      className:
                                        'mt-1.5 w-full px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/40 text-xs outline-none focus:border-rose-400'
                                    }),
                                  ((i = w[$.id]) == null ? void 0 : i.estado) === 'NA' &&
                                    e.jsx('input', {
                                      value: ((T = w[$.id]) == null ? void 0 : T.nota) || '',
                                      disabled: t,
                                      onChange: (B) => M($.id, B.target.value),
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
                                  e.jsx(te, {
                                    pid: $.id,
                                    val: 'OK',
                                    icon: e.jsx(Se, { size: 16 }),
                                    activeCls: 'bg-emerald-500 border-emerald-500 text-white'
                                  }),
                                  e.jsx(te, {
                                    pid: $.id,
                                    val: 'NO',
                                    icon: e.jsx($e, { size: 16 }),
                                    activeCls: 'bg-rose-500 border-rose-500 text-white'
                                  }),
                                  e.jsx(te, {
                                    pid: $.id,
                                    val: 'NA',
                                    icon: e.jsx(ss, { size: 16 }),
                                    activeCls: 'bg-slate-400 border-slate-400 text-white'
                                  })
                                ]
                              })
                            ]
                          },
                          $.id
                        );
                      })
                    })
                  ]
                },
                C.nivel
              )
            ),
            e.jsxs('div', {
              className: 'bg-white rounded-2xl border border-slate-200 p-5',
              children: [
                e.jsxs('h3', {
                  className: 'text-sm font-black text-slate-800 mb-3 flex items-center gap-2',
                  children: [
                    e.jsx(ha, { size: 16, className: 'text-slate-400' }),
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
                          value: Q.esperado || '',
                          disabled: t,
                          inputMode: 'decimal',
                          onChange: (C) =>
                            _('pesos', { ...Q, esperado: C.target.value.replace(/[^0-9.,]/g, '') }),
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
                          value: Q.registrado || '',
                          disabled: t,
                          inputMode: 'decimal',
                          onChange: (C) =>
                            _('pesos', {
                              ...Q,
                              registrado: C.target.value.replace(/[^0-9.,]/g, '')
                            }),
                          placeholder: 'Ej. 125,3',
                          className:
                            'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400'
                        })
                      ]
                    }),
                    e.jsx('div', {
                      className: 'col-span-2 sm:col-span-1',
                      children: ee
                        ? e.jsxs('span', {
                            className: `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-black ${ee === 'CONFORME' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`,
                            children: [
                              ee === 'CONFORME' ? e.jsx(Se, { size: 15 }) : e.jsx(fe, { size: 15 }),
                              ' ',
                              ee
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
                        e.jsx(is, { size: 16, className: 'text-slate-400' }),
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
                          value: O.bultosTotal ?? s.bultos ?? '',
                          disabled: t,
                          inputMode: 'numeric',
                          onChange: (C) => _('bultosTotal', C.target.value.replace(/[^0-9]/g, '')),
                          className:
                            'w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-black text-center outline-none focus:border-emerald-400'
                        })
                      ]
                    })
                  ]
                }),
                ae > 0
                  ? e.jsxs(e.Fragment, {
                      children: [
                        e.jsx('div', {
                          className: 'flex flex-wrap gap-2',
                          children: Array.from({ length: Math.min(ae, 60) }, (C, $) =>
                            e.jsxs(
                              'button',
                              {
                                type: 'button',
                                disabled: t,
                                onClick: () => I($),
                                className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${me[$] ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'}`,
                                children: [
                                  'Bulto ',
                                  $ + 1,
                                  '/',
                                  ae,
                                  ' · ',
                                  me[$] ? 'Etiqueta OK' : 'Pendiente'
                                ]
                              },
                              $
                            )
                          )
                        }),
                        e.jsxs('p', {
                          className: 'text-xs font-bold mt-2 text-slate-500',
                          children: [
                            me.slice(0, ae).filter(Boolean).length,
                            '/',
                            ae,
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
                    e.jsx(fe, { size: 16, className: 'text-slate-400' }),
                    ' Riesgos evaluados'
                  ]
                }),
                e.jsx('div', {
                  className: 'flex flex-wrap gap-2',
                  children: hs.map((C) => {
                    const $ = (O.riesgos || []).includes(C.id);
                    return e.jsxs(
                      'button',
                      {
                        type: 'button',
                        disabled: t,
                        onClick: () => le(C.id),
                        className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${$ ? (C.id === 'NINGUNO' ? 'bg-slate-700 border-slate-700 text-white' : 'bg-amber-500 border-amber-500 text-white') : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'}`,
                        children: [$ ? '☑' : '☐', ' ', C.label]
                      },
                      C.id
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
                    e.jsx(Te, { size: 16, className: 'text-slate-400' }),
                    ' Evidencia fotográfica'
                  ]
                }),
                e.jsx('div', {
                  className: 'grid sm:grid-cols-3 gap-3',
                  children: Ba.map((C) => {
                    const $ = X.filter((H) => H.tipo === C.id);
                    return e.jsxs(
                      'div',
                      {
                        className: 'rounded-xl border border-slate-100 p-3',
                        children: [
                          e.jsxs('p', {
                            className:
                              'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2',
                            children: ['📷 ', C.label, ' (', $.length, ')']
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2 flex-wrap',
                            children: [
                              $.map((H) =>
                                e.jsxs(
                                  'div',
                                  {
                                    className:
                                      'relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0',
                                    children: [
                                      e.jsx('a', {
                                        href: V[H.path] || '#',
                                        target: '_blank',
                                        rel: 'noreferrer',
                                        children: e.jsx('img', {
                                          src: V[H.path] || '',
                                          alt: C.label,
                                          className: 'w-full h-full object-cover'
                                        })
                                      }),
                                      !t &&
                                        e.jsx('button', {
                                          onClick: () => q(H),
                                          title: 'Eliminar foto',
                                          className:
                                            'absolute top-0.5 right-0.5 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity',
                                          children: e.jsx(he, { size: 11 })
                                        })
                                    ]
                                  },
                                  H.path
                                )
                              ),
                              !t &&
                                Z &&
                                e.jsxs('button', {
                                  type: 'button',
                                  onClick: () => y(C.id, 'camara'),
                                  disabled: oe,
                                  title: 'Tomar foto con la cámara',
                                  className:
                                    'w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-emerald-300 text-emerald-500 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40',
                                  children: [
                                    oe && ne === C.id
                                      ? e.jsx(_e, { size: 16, className: 'animate-spin' })
                                      : e.jsx(Te, { size: 16 }),
                                    e.jsx('span', {
                                      className: 'text-[8px] font-black uppercase',
                                      children: 'Cámara'
                                    })
                                  ]
                                }),
                              !t &&
                                e.jsxs('button', {
                                  type: 'button',
                                  onClick: () => y(C.id, 'galeria'),
                                  disabled: oe,
                                  title: 'Subir foto desde archivos/galería',
                                  className:
                                    'w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40',
                                  children: [
                                    oe && ne === C.id
                                      ? e.jsx(_e, { size: 16, className: 'animate-spin' })
                                      : e.jsx(ns, { size: 16 }),
                                    e.jsx('span', {
                                      className: 'text-[8px] font-black uppercase',
                                      children: Z ? 'Galería' : 'Foto'
                                    })
                                  ]
                                }),
                              $.length === 0 &&
                                t &&
                                e.jsx('span', {
                                  className: 'text-xs text-slate-300',
                                  children: 'Sin fotos'
                                })
                            ]
                          })
                        ]
                      },
                      C.id
                    );
                  })
                }),
                e.jsx('input', {
                  ref: J,
                  type: 'file',
                  accept: 'image/*',
                  multiple: !0,
                  onChange: G,
                  className: 'hidden'
                }),
                F &&
                  e.jsx(ys, {
                    onCapture: (C) => G({ target: { files: [C], value: '' } }),
                    onClose: () => W(!1)
                  }),
                e.jsx('p', {
                  className: 'text-[10px] text-slate-400 mt-2',
                  children:
                    'Las fotos quedan asociadas al certificado (bucket privado) y se incrustan en el PDF.'
                })
              ]
            }),
            (a || b) &&
              e.jsxs('div', {
                className: `rounded-2xl border p-5 ${a ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'}`,
                children: [
                  e.jsxs('label', {
                    className:
                      'text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-rose-500',
                    children: [
                      'Disposición / Acción a tomar ',
                      a && e.jsx('span', { children: '*obligatoria' })
                    ]
                  }),
                  e.jsxs('select', {
                    value: b,
                    disabled: t,
                    onChange: (C) => z(C.target.value),
                    className:
                      'mt-1.5 w-full px-3 py-2 rounded-xl border border-rose-200 text-sm font-bold outline-none focus:border-rose-400 bg-white',
                    children: [
                      e.jsx('option', { value: '', children: '— Seleccionar disposición —' }),
                      Ua.map((C) => e.jsx('option', { value: C, children: C }, C))
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
                  value: L,
                  disabled: t,
                  onChange: (C) => v(C.target.value),
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
                  m > 0
                    ? e.jsxs('span', {
                        className: 'text-slate-500',
                        children: [m, ' ítem(s) por responder']
                      })
                    : a
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
                    onClick: A,
                    disabled: c.isPending,
                    className:
                      'px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50',
                    children: 'Guardar avance'
                  }),
                  e.jsx('button', {
                    onClick: Y,
                    disabled: c.isPending || m > 0,
                    className: `px-4 py-2.5 rounded-xl text-white font-black text-sm flex items-center gap-2 disabled:opacity-40 ${a ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`,
                    children: a
                      ? e.jsxs(e.Fragment, {
                          children: [e.jsx(Fs, { size: 16 }), ' Finalizar (No Conforme)']
                        })
                      : e.jsxs(e.Fragment, {
                          children: [e.jsx(Le, { size: 16 }), ' Certificar salida']
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
              e.jsx(fe, { size: 16 }),
              ' Salida ',
              e.jsx('b', { children: 'NO CONFORME' }),
              '. No despachar hasta resolver.',
              s.disposicion ? ` Disposición: ${s.disposicion}.` : ''
            ]
          })
      ]
    });
  },
  Tt = () => {
    const { hasPermission: s, user: d } = ye(),
      l = s('manage_quality') || s('manage_monitoreo'),
      c = (d == null ? void 0 : d.rol) === 'ADMIN' || (d == null ? void 0 : d.es_admin_delegado),
      { data: E = [], isLoading: h, refetch: t, isFetching: g } = Ma(),
      u = Vs(),
      [w, p] = f.useState(null),
      [O, x] = f.useState(!1),
      [L, v] = f.useState(''),
      [b, z] = f.useState('TODOS'),
      P = async (o, a) => {
        if (
          (a.stopPropagation(),
          !!confirm(
            `¿Eliminar la certificación de salida (NV ${o.oc || '—'})? Esta acción no se puede deshacer.`
          ))
        )
          try {
            (await u.mutateAsync(o.id), S.success('Certificación eliminada'));
          } catch (m) {
            S.error(`No se pudo eliminar: ${m.message}`);
          }
      },
      M = E.filter((o) => o.estado === 'PENDIENTE' || o.estado === 'EN_PROCESO').length,
      R = f.useMemo(() => {
        const o = L.trim().toLocaleLowerCase('es-CL');
        return E.filter((a) => {
          const m = a.contexto || {};
          return (
            (!o ||
              [a.oc, a.proveedor, a.folio, m.cliente, m.guia, m.transportista].some((N) =>
                String(N || '')
                  .toLocaleLowerCase('es-CL')
                  .includes(o)
              )) &&
            (b === 'TODOS' || a.estado === b)
          );
        });
      }, [L, b, E]),
      _ = (w && E.find((o) => o.id === w)) || null;
    return _
      ? e.jsx($t, { tarea: _, onBack: () => p(null), canManage: l })
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
                          disabled: g,
                          className:
                            'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                          children: [
                            e.jsx(_e, { size: 14, className: g ? 'animate-spin' : '' }),
                            ' Actualizar'
                          ]
                        }),
                        l &&
                          e.jsxs('button', {
                            onClick: () => x(!0),
                            className:
                              'px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-emerald-700',
                            children: [e.jsx(ba, { size: 14 }), ' Certificar salida (N.V. + SKU)']
                          })
                      ]
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2',
                  children: [
                    e.jsx(es, { label: 'Total', value: E.length, tone: 'slate' }),
                    e.jsx(es, { label: 'Por certificar', value: M, tone: 'amber' }),
                    e.jsx(es, { label: 'Emitidas', value: E.length - M, tone: 'emerald' })
                  ]
                }),
                e.jsxs('div', {
                  className: 'mt-4 flex flex-col lg:flex-row gap-2',
                  children: [
                    e.jsxs('label', {
                      className: 'relative flex-1',
                      children: [
                        e.jsx(ge, {
                          size: 16,
                          className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                        }),
                        e.jsx('input', {
                          value: L,
                          onChange: (o) => v(o.target.value),
                          placeholder: 'Buscar N.V., OC, proveedor, cliente o folio…',
                          className:
                            'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100'
                        })
                      ]
                    }),
                    e.jsx('div', {
                      className: 'flex gap-1 overflow-x-auto pb-0.5',
                      children: ['TODOS', 'PENDIENTE', 'EN_PROCESO', 'CONFORME', 'NO_CONFORME'].map(
                        (o) => {
                          var a;
                          return e.jsx(
                            'button',
                            {
                              onClick: () => z(o),
                              className: `whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-black tracking-wide transition ${b === o ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-200'}`,
                              children:
                                o === 'TODOS'
                                  ? 'Todos'
                                  : ((a = ze[o]) == null ? void 0 : a.label) || o
                            },
                            o
                          );
                        }
                      )
                    })
                  ]
                }),
                !h &&
                  e.jsxs('p', {
                    className: 'mt-2 text-[11px] font-bold text-slate-400',
                    children: ['Mostrando ', R.length, ' de ', E.length, ' certificaciones.']
                  })
              ]
            }),
            h
              ? e.jsx('div', {
                  className: 'flex justify-center py-20',
                  children: e.jsx(pe, { className: 'animate-spin text-emerald-500', size: 36 })
                })
              : E.length === 0
                ? e.jsxs('div', {
                    className: 'flex flex-col items-center justify-center py-20 text-center',
                    children: [
                      e.jsx(Qe, { size: 44, className: 'text-slate-200 mb-4' }),
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
                : R.length === 0
                  ? e.jsxs('div', {
                      className:
                        'rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center',
                      children: [
                        e.jsx(ge, { size: 34, className: 'mx-auto mb-3 text-slate-300' }),
                        e.jsx('h3', {
                          className: 'font-bold text-slate-500',
                          children: 'No hay certificaciones que coincidan'
                        }),
                        e.jsx('button', {
                          onClick: () => {
                            (v(''), z('TODOS'));
                          },
                          className: 'mt-2 text-xs font-black text-teal-600 hover:text-teal-700',
                          children: 'Limpiar filtros'
                        })
                      ]
                    })
                  : e.jsx('div', {
                      className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
                      children: R.map((o) => {
                        const a = ze[o.estado] || {},
                          m = o.contexto || {},
                          n = o.estado === 'PENDIENTE' || o.estado === 'EN_PROCESO';
                        return e.jsxs(
                          'div',
                          {
                            role: 'button',
                            tabIndex: 0,
                            onClick: () => p(o.id),
                            className: `cursor-pointer text-left bg-white rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${n ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-emerald-300'}`,
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center justify-between mb-3 gap-2',
                                children: [
                                  e.jsxs('span', {
                                    className:
                                      'flex items-center gap-1.5 font-black text-slate-900 truncate',
                                    children: [
                                      e.jsx(Re, { size: 16, className: 'text-slate-400 shrink-0' }),
                                      o.proveedor || m.cliente || 'Sin cliente'
                                    ]
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-1.5 shrink-0',
                                    children: [
                                      e.jsx('span', {
                                        className: `text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${a.cls}`,
                                        children: a.label || o.estado
                                      }),
                                      c &&
                                        e.jsx('button', {
                                          onClick: (N) => P(o, N),
                                          title: 'Eliminar (admin)',
                                          className:
                                            'p-1.5 rounded-lg text-slate-300 hover:bg-rose-100 hover:text-rose-600',
                                          children: e.jsx(he, { size: 14 })
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
                                    children: ['NV ', o.oc || m.nv || '—']
                                  }),
                                  o.folio &&
                                    e.jsx('span', {
                                      className:
                                        'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-600 border-emerald-200 font-mono',
                                      children: o.folio
                                    }),
                                  (o.estado === 'CONFORME' || o.estado === 'NO_CONFORME') &&
                                    (() => {
                                      const N = ke(o);
                                      return e.jsxs('span', {
                                        className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${N.cls}`,
                                        children: [N.emoji, ' ', N.label]
                                      });
                                    })()
                                ]
                              }),
                              e.jsxs('p', {
                                className: 'text-sm text-slate-500 font-medium',
                                children: ['Guía ', m.guia || '—', ' · ', o.fecha_recepcion || '—']
                              }),
                              o.bultos != null &&
                                e.jsxs('p', {
                                  className: 'text-xs text-slate-400 mt-1',
                                  children: [
                                    o.bultos,
                                    ' bultos ·',
                                    ' ',
                                    m.transportista || m.empresa_transporte || 's/transportista'
                                  ]
                                })
                            ]
                          },
                          o.id
                        );
                      })
                    }),
            O &&
              e.jsx(zt, {
                onClose: () => x(!1),
                onCreated: (o) => {
                  (x(!1), o && p(o));
                }
              })
          ]
        });
  },
  es = ({ label: s, value: d, tone: l }) => {
    const c = {
      slate: 'bg-white text-slate-800 border-slate-200',
      amber: 'bg-amber-50 text-amber-700 border-amber-200',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return e.jsxs('div', {
      className: `rounded-xl border px-3 py-2 ${c[l] || c.slate}`,
      children: [
        e.jsx('p', { className: 'text-lg font-black leading-none', children: d }),
        e.jsx('p', {
          className: 'mt-1 text-[9px] font-black uppercase tracking-widest opacity-70',
          children: s
        })
      ]
    });
  },
  Lt = () => {
    var s;
    return (s = globalThis.crypto) != null && s.randomUUID
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  },
  rs = {
    ROJO: 'bg-rose-500',
    NARANJA: 'bg-amber-500',
    VERDE: 'bg-emerald-500',
    NA: 'bg-slate-300'
  },
  la = {
    BORRADOR: 'bg-slate-100 text-slate-600 border-slate-200',
    ENVIADO_CALIDAD: 'bg-blue-100 text-blue-700 border-blue-200',
    DICTAMINADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CERRADO: 'bg-slate-800 text-white border-slate-800'
  },
  Rs = {
    MONITOREO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DANOS: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  Pt = ({ codigo: s, value: d, onSelect: l }) => {
    const [c, E] = f.useState(!1),
      [h, t] = f.useState(''),
      [g, u] = f.useState([]),
      [w, p] = f.useState(!1),
      O = Ts.useRef(null);
    (f.useEffect(() => {
      if (!c) return;
      let L = !0;
      p(!0);
      const v = setTimeout(async () => {
        try {
          const b = await ut(s, h);
          L && u(b);
        } catch {
          L && u([]);
        } finally {
          L && p(!1);
        }
      }, 220);
      return () => {
        ((L = !1), clearTimeout(v));
      };
    }, [c, h, s]),
      f.useEffect(() => {
        const L = (v) => {
          O.current && !O.current.contains(v.target) && E(!1);
        };
        return (
          c && document.addEventListener('mousedown', L),
          () => document.removeEventListener('mousedown', L)
        );
      }, [c]));
    const x = (L) => {
      (l(L.valor, L.ubicacion || ''), E(!1), t(''));
    };
    return e.jsxs('div', {
      className: 'relative',
      ref: O,
      children: [
        e.jsxs('button', {
          type: 'button',
          onClick: () => E((L) => !L),
          className:
            'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-left outline-none hover:border-emerald-400 flex items-center justify-between gap-2',
          children: [
            e.jsx('span', {
              className: d ? 'text-slate-800 truncate' : 'text-slate-300',
              children: d || 'Elegir lote / serie…'
            }),
            e.jsx(ge, { size: 14, className: 'text-slate-400 shrink-0' })
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
                  value: h,
                  onChange: (L) => t(L.target.value),
                  placeholder: 'Filtrar lote (P) o serie (S)…',
                  className:
                    'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-400'
                })
              }),
              e.jsx('div', {
                className: 'max-h-56 overflow-y-auto',
                children: w
                  ? e.jsxs('div', {
                      className: 'py-6 text-center text-xs text-slate-400',
                      children: [
                        e.jsx(pe, { size: 16, className: 'animate-spin inline mr-1' }),
                        ' Buscando…'
                      ]
                    })
                  : g.length === 0
                    ? e.jsxs('div', {
                        className: 'py-5 text-center text-xs text-slate-400',
                        children: ['Sin lotes/series ', h ? `para "${h}"` : '']
                      })
                    : g.map((L, v) =>
                        e.jsxs(
                          'button',
                          {
                            type: 'button',
                            onClick: () => x(L),
                            className:
                              'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-emerald-50/50 border-b border-slate-50 last:border-0',
                            children: [
                              e.jsx('span', {
                                className: `text-[9px] font-black px-1.5 py-0.5 rounded ${L.tipo === 'P' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`,
                                children: L.tipo === 'P' ? 'LOTE' : 'SERIE'
                              }),
                              e.jsx('span', {
                                className:
                                  'font-mono text-xs font-bold text-slate-800 truncate flex-1',
                                children: L.valor
                              }),
                              L.ubicacion &&
                                e.jsx('span', {
                                  className: 'text-[10px] text-slate-400 font-mono shrink-0',
                                  children: L.ubicacion
                                }),
                              e.jsx('span', {
                                className: `text-xs font-bold shrink-0 ${Number(L.disponible) > 0 ? 'text-emerald-600' : 'text-slate-300'}`,
                                children: Number(L.disponible) || 0
                              })
                            ]
                          },
                          v
                        )
                      )
              })
            ]
          })
      ]
    });
  },
  Is = 'Lote no encontrado en el sistema al momento de la inspección',
  Ft = [
    { id: 'system', label: 'Sistema' },
    { id: 'manual', label: 'Manual' },
    { id: 'none', label: 'Sin lote/partida' },
    { id: 'not_found', label: 'No corresponde a los mostrados' }
  ],
  Mt = ({ item: s, onChange: d }) => {
    const l = s.batch_source || (s.partida ? 'system' : 'none'),
      c = s.batch_value ?? s.partida ?? '',
      E = (t) => {
        var u;
        const g = {
          batch_source: t,
          batch_value: ['none', 'not_found'].includes(t) ? null : '',
          partida: ''
        };
        (t === 'not_found' &&
          !String(s.observaciones || '').includes(Is) &&
          (g.observaciones = [(u = s.observaciones) == null ? void 0 : u.trim(), Is]
            .filter(Boolean)
            .join(' · ')),
          d(g));
      },
      h = (t, g = '') =>
        d({ batch_value: t || null, partida: t || '', ...(g ? { ubicacion: g } : {}) });
    return e.jsxs('div', {
      className: 'mt-1 rounded-xl border border-slate-200 p-3 bg-slate-50/50',
      children: [
        e.jsx('div', {
          className: 'grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3',
          children: Ft.map((t) =>
            e.jsxs(
              'label',
              {
                className: `flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[11px] font-bold cursor-pointer ${l === t.id ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`,
                children: [
                  e.jsx('input', {
                    type: 'radio',
                    name: `batch-${s._key}`,
                    checked: l === t.id,
                    onChange: () => E(t.id)
                  }),
                  t.label
                ]
              },
              t.id
            )
          )
        }),
        l === 'system' && e.jsx(Pt, { codigo: s.codigo_producto, value: c, onSelect: h }),
        l === 'manual' &&
          e.jsx('input', {
            value: c,
            onChange: (t) => h(t.target.value.toUpperCase()),
            placeholder: 'Escribe el lote/partida no registrado',
            className:
              'w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-sm font-mono font-bold outline-none focus:border-amber-500'
          }),
        l === 'none' &&
          e.jsx('p', {
            className: 'text-[11px] text-slate-500',
            children: 'Se guardará sin lote o partida.'
          }),
        l === 'not_found' &&
          e.jsx('p', {
            className: 'text-[11px] text-amber-700',
            children: 'Se guardará sin lote y se añadirá automáticamente la observación estándar.'
          })
      ]
    });
  },
  Ds = ({
    informe: s,
    prefillItems: d,
    asignacion: l,
    asignacionId: c,
    onCancel: E,
    onSaved: h
  }) => {
    const { user: t } = ye(),
      g = ia(),
      u = !!s,
      w = Za(),
      p = Ya(),
      { data: O } = gs(u ? s.id : null),
      x = (l == null ? void 0 : l.id) || c || null,
      [L, v] = f.useState((s == null ? void 0 : s.bodega) || ''),
      [b, z] = f.useState((s == null ? void 0 : s.periodicidad) || 'SEMANAL'),
      [P, M] = f.useState((s == null ? void 0 : s.observaciones) || ''),
      [R, _] = f.useState(''),
      [o, a] = f.useState(!1),
      [m, n] = f.useState([]),
      [N, j] = f.useState(!1),
      [A, Y] = f.useState([]),
      [J, F] = f.useState(null),
      [W, Z] = f.useState([]),
      [ne, xe] = f.useState(!x),
      [oe, D] = f.useState({ status: 'idle', savedAt: null, error: '' }),
      [V, se] = f.useState(
        x
          ? {
              name:
                (l == null ? void 0 : l.locked_by_name) ||
                (t == null ? void 0 : t.nombre) ||
                'Usuario actual',
              at: (l == null ? void 0 : l.locked_at) || new Date().toISOString()
            }
          : null
      ),
      X = f.useRef(!1);
    f.useEffect(() => {
      u &&
        O &&
        !X.current &&
        ((X.current = !0),
        Y(
          O.map((i) => ({
            _key: `${i.codigo_producto}|${i.partida || ''}|${i.ubicacion || ''}`,
            codigo_producto: i.codigo_producto,
            partida: i.partida || '',
            ubicacion: i.ubicacion || '',
            producto: i.producto || '',
            unidad_medida: i.unidad_medida || '',
            cantidad: Number(i.cantidad) || 0,
            estado_inventario: i.estado_inventario || 'Disponible',
            tipo: i.tipo || 'NO_PERECIBLE',
            fecha_vencimiento: i.fecha_vencimiento || null,
            semaforo: i.semaforo || 'NA',
            condicion_observada: i.condicion_observada || 'OK',
            cantidad_afectada: Number(i.cantidad_afectada) || 0,
            no_registrado: !!i.no_registrado,
            motivo: i.motivo || 'Rutina',
            observaciones: i.observaciones || '',
            batch_source: i.batch_source || (i.partida ? 'system' : 'none'),
            batch_value: i.batch_value ?? i.partida ?? null,
            revision_estado: i.revision_estado || 'PENDIENTE'
          }))
        ));
    }, [u, O]);
    const y = f.useRef(!1);
    f.useEffect(() => {
      var i, T, B;
      if (!u && x && !y.current) {
        y.current = !0;
        const r = l == null ? void 0 : l.progress_data,
          k = Array.isArray(r == null ? void 0 : r.items) ? r.items : null;
        if (k != null && k.length) {
          (v(((i = r == null ? void 0 : r.header) == null ? void 0 : i.bodega) || ''),
            z(((T = r == null ? void 0 : r.header) == null ? void 0 : T.periodicidad) || 'SEMANAL'),
            M(((B = r == null ? void 0 : r.header) == null ? void 0 : B.observaciones) || ''),
            Z(Array.isArray(r == null ? void 0 : r.selected_sku_ids) ? r.selected_sku_ids : []),
            Y(
              k.map((K, ce) => ({
                ...K,
                _key:
                  K._key ||
                  `${K.codigo_producto}|${K.batch_value || K.partida || ''}|${K.ubicacion || ''}|${ce}`,
                revision_estado: K.revision_estado || 'PENDIENTE',
                batch_source: K.batch_source || (K.partida ? 'system' : 'none'),
                batch_value: K.batch_value ?? K.partida ?? null
              }))
            ),
            D({
              status: 'saved',
              savedAt:
                (l == null ? void 0 : l.progress_updated_at) ||
                (r == null ? void 0 : r.saved_at) ||
                null,
              error: ''
            }),
            xe(!0));
          return;
        }
        const U = Array.isArray(d) ? d : (l == null ? void 0 : l.skus) || [];
        (Y(
          U.map((K) => ({
            _key: `${K.codigo_producto}|${K.partida || ''}|${K.ubicacion || ''}`,
            codigo_producto: K.codigo_producto,
            partida: K.partida || '',
            ubicacion: K.ubicacion || '',
            producto: K.producto || '',
            unidad_medida: K.unidad_medida || 'UN',
            cantidad: Number(K.cantidad) || 0,
            estado_inventario: 'Disponible',
            tipo: K.tipo || 'NO_PERECIBLE',
            fecha_vencimiento: K.fecha_vencimiento || null,
            semaforo: K.semaforo || 'NA',
            condicion_observada: 'OK',
            cantidad_afectada: 0,
            no_registrado: !1,
            motivo: 'Hallazgo',
            observaciones: '',
            batch_source: K.batch_source || (K.partida ? 'system' : 'none'),
            batch_value: K.batch_value ?? K.partida ?? null,
            revision_estado: 'PENDIENTE'
          }))
        ),
          xe(!0));
      }
    }, [l, u, d, x]);
    const G = f.useCallback(async () => {
        j(!0);
        try {
          const i = await Ws(R, o);
          n(i);
        } catch (i) {
          S.error(`Error buscando stock: ${i.message}`);
        } finally {
          j(!1);
        }
      }, [R, o]),
      q = (i) => {
        const T = `${i.codigo_producto}|${i.partida || ''}|${i.ubicacion || ''}`;
        if (A.some((B) => B._key === T)) {
          S.info('Ese ítem ya está en el informe');
          return;
        }
        Y((B) => [
          ...B,
          {
            _key: T,
            codigo_producto: i.codigo_producto,
            partida: i.partida || '',
            ubicacion: i.ubicacion || '',
            producto: i.producto || '',
            unidad_medida: i.unidad_medida || '',
            cantidad: Number(i.disponible) || 0,
            estado_inventario: 'Disponible',
            tipo: i.tipo || 'NO_PERECIBLE',
            fecha_vencimiento: i.fecha_vencimiento || null,
            semaforo: i.semaforo || 'NA',
            condicion_observada: 'OK',
            cantidad_afectada: 0,
            no_registrado: !1,
            motivo: 'Rutina',
            observaciones: '',
            batch_source: i.partida ? 'system' : 'none',
            batch_value: i.partida || null,
            revision_estado: 'PENDIENTE'
          }
        ]);
      },
      le = () => {
        const i = (J.codigo || '').trim().toUpperCase(),
          T = (J.ubicacion || '').trim().toUpperCase();
        if (!i) {
          S.error('Ingresa el código del producto');
          return;
        }
        if (!T) {
          S.error('La ubicación es obligatoria');
          return;
        }
        const B = `MAN|${i}|${(J.partida || '').trim()}|${T}`;
        if (A.some((r) => r._key === B)) {
          S.info('Ese ítem ya está en el informe');
          return;
        }
        (Y((r) => [
          ...r,
          {
            _key: B,
            codigo_producto: i,
            partida: (J.partida || '').trim().toUpperCase(),
            ubicacion: T,
            producto: (J.producto || '').trim() || 'SIN DESCRIPCIÓN',
            unidad_medida: 'UN',
            cantidad: Number(J.cantidad) || 0,
            estado_inventario: 'No registrado',
            tipo: 'NO_PERECIBLE',
            fecha_vencimiento: null,
            semaforo: 'NA',
            condicion_observada: 'Sobrante',
            cantidad_afectada: Number(J.cantidad) || 0,
            no_registrado: !0,
            motivo: 'Hallazgo',
            observaciones: '',
            batch_source: J.partida ? 'manual' : 'none',
            batch_value: J.partida || null,
            revision_estado: 'RECHAZADO'
          }
        ]),
          F(null),
          S.success('Ítem manual agregado (no registrado)'));
      },
      ae = (i, T, B) => {
        Y((r) => r.map((k) => (k._key === i ? { ...k, [T]: B } : k)));
      },
      me = (i, T) => {
        Y((B) => B.map((r) => (r._key === i ? { ...r, ...T } : r)));
      },
      I = (i, T) =>
        Y((B) =>
          B.map((r) =>
            r._key === i
              ? {
                  ...r,
                  condicion_observada: T,
                  revision_estado: T === 'OK' ? 'APROBADO' : 'RECHAZADO',
                  ...(T === 'OK' ? { cantidad_afectada: 0 } : {})
                }
              : r
          )
        ),
      Q = (i) => {
        (Y((T) => T.filter((B) => B._key !== i)), Z((T) => T.filter((B) => B !== i)));
      },
      ee = (i) => Z((T) => (T.includes(i) ? T.filter((B) => B !== i) : [...T, i])),
      de = () => Z((i) => (i.length === A.length ? [] : A.map((T) => T._key))),
      te = (i) => {
        if (W.length === 0) {
          S.info('Selecciona uno o más SKUs');
          return;
        }
        Y((T) =>
          T.map((B) =>
            W.includes(B._key)
              ? i === 'APROBADO'
                ? {
                    ...B,
                    revision_estado: 'APROBADO',
                    condicion_observada: 'OK',
                    cantidad_afectada: 0
                  }
                : {
                    ...B,
                    revision_estado: 'RECHAZADO',
                    condicion_observada:
                      B.condicion_observada === 'OK' ? 'Daño de producto' : B.condicion_observada
                  }
              : B
          )
        );
      },
      Ne = f.useMemo(
        () => ({
          version: 1,
          saved_at: new Date().toISOString(),
          header: { bodega: L, periodicidad: b, observaciones: P },
          items: A,
          selected_sku_ids: W
        }),
        [L, A, P, b, W]
      );
    f.useEffect(() => {
      if (!x || !ne || oe.status === 'conflict') return;
      D((T) => ({ ...T, status: 'pending', error: '' }));
      const i = window.setTimeout(async () => {
        D((T) => ({ ...T, status: 'saving', error: '' }));
        try {
          const T = await Xa(x, Ne);
          (D({
            status: 'saved',
            savedAt: (T == null ? void 0 : T.saved_at) || new Date().toISOString(),
            error: ''
          }),
            se({
              name:
                (T == null ? void 0 : T.locked_by_name) ||
                (V == null ? void 0 : V.name) ||
                (t == null ? void 0 : t.nombre) ||
                'Usuario actual',
              at: (T == null ? void 0 : T.locked_at) || new Date().toISOString()
            }));
        } catch (T) {
          const B =
            (T == null ? void 0 : T.code) === 'QUALITY_TASK_LOCKED' ||
            (T == null ? void 0 : T.status) === 409;
          D({
            status: B ? 'conflict' : 'error',
            savedAt: null,
            error: (T == null ? void 0 : T.message) || 'No se pudo guardar el progreso'
          });
        }
      }, 1500);
      return () => window.clearTimeout(i);
    }, [ne, Ne, x, t == null ? void 0 : t.nombre]);
    const C = async () => {
        if (x && oe.status !== 'conflict')
          try {
            await ct(x);
          } catch (i) {
            console.warn('No se pudo liberar el bloqueo de Calidad', i);
          }
        E();
      },
      $ = async (i) => {
        if (A.length === 0) {
          S.error('Agrega al menos un ítem');
          return;
        }
        if (i === 'ENVIADO_CALIDAD') {
          const B = A.filter((U) => !(U.ubicacion || '').trim());
          if (B.length > 0) {
            S.error(`${B.length} ítem(s) sin ubicación. Es obligatoria para enviar a Calidad.`);
            return;
          }
          const r = A.filter(
            (U) =>
              ['system', 'manual'].includes(U.batch_source) &&
              !(U.batch_value || U.partida || '').trim()
          );
          if (r.length > 0) {
            S.error(`${r.length} ítem(s) requieren elegir o escribir el lote.`);
            return;
          }
          const k = A.filter((U) => U.revision_estado === 'PENDIENTE');
          if (x && k.length > 0) {
            S.error(`Aún faltan ${k.length} SKU(s) por aprobar o rechazar.`);
            return;
          }
        }
        const T = A.map(({ _key: B, ...r }) => r);
        try {
          if (x) {
            const r = await Zs(x);
            se({
              name:
                (r == null ? void 0 : r.locked_by_name) ||
                (t == null ? void 0 : t.nombre) ||
                'Usuario actual',
              at: (r == null ? void 0 : r.locked_at) || new Date().toISOString()
            });
          }
          let B = u ? s.id : null;
          if (u) {
            const r = { bodega: L || null, periodicidad: b, estado: i, observaciones: P || null };
            (await p.mutateAsync({ informeId: s.id, cabecera: r, items: T }),
              S.success('Informe actualizado'));
          } else {
            const r = {
                fecha: new Date().toISOString().slice(0, 10),
                analista_id: (t == null ? void 0 : t.id) || null,
                analista_nombre: (t == null ? void 0 : t.nombre) || null,
                bodega: L || null,
                periodicidad: b,
                estado: i,
                observaciones: P || null
              },
              k = await w.mutateAsync({
                cabecera: r,
                items: T,
                asignacionId: i === 'ENVIADO_CALIDAD' ? x : null
              });
            ((B = (k == null ? void 0 : k.id) || null),
              S.success(
                i === 'ENVIADO_CALIDAD' ? 'Informe enviado a Calidad' : 'Borrador guardado'
              ),
              x &&
                (k == null ? void 0 : k.asignacion_estado) === 'RESUELTA' &&
                S.success('Asignación de estancia resuelta'));
          }
          if (i === 'ENVIADO_CALIDAD' && B)
            try {
              const r = await dt(B);
              ((r == null ? void 0 : r.flags) > 0 &&
                (g.invalidateQueries({ queryKey: ['calidad_flags'] }),
                S.info(`${r.flags} ubicación(es) marcadas "En Auditoría"`)),
                (r == null ? void 0 : r.alertas) > 0 &&
                  (S.warning(`${r.alertas} alerta(s) a Inventario por SKU no registrado`),
                  xt(r.alertas, B)));
            } catch (r) {
              console.error('preliminar', r);
            }
          h();
        } catch (B) {
          S.error(`Error al guardar: ${B.message}`);
        }
      },
      H = A.filter((i) => !(i.ubicacion || '').trim()).length,
      re = A.filter((i) => i.revision_estado !== 'PENDIENTE').length,
      ie = A.length > 0 ? Math.round((re / A.length) * 100) : 0,
      be = (i, T) =>
        T
          ? i === 'OK'
            ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
            : 'bg-amber-100 text-amber-800 border-amber-300'
          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100',
      ue = w.isPending || p.isPending;
    return oe.status === 'conflict'
      ? e.jsxs('div', {
          className: 'space-y-4',
          children: [
            e.jsxs('button', {
              onClick: C,
              className:
                'flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700',
              children: [e.jsx(Ie, { size: 17 }), ' Volver a las tareas']
            }),
            e.jsxs('div', {
              className: 'rounded-2xl border border-rose-300 bg-rose-50 p-6 text-rose-900',
              children: [
                e.jsx('h2', { className: 'text-lg font-black', children: 'Edición bloqueada' }),
                e.jsx('p', { className: 'mt-2 text-sm font-bold', children: oe.error }),
                e.jsx('p', {
                  className: 'mt-2 text-xs',
                  children:
                    'No se enviarán más cambios desde esta pantalla. El bloqueo protege el avance guardado por la otra persona.'
                })
              ]
            })
          ]
        })
      : e.jsxs('div', {
          className: 'space-y-5',
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-4',
              children: [
                e.jsx('button', {
                  onClick: C,
                  className:
                    'p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm',
                  children: e.jsx(Ie, { size: 22 })
                }),
                e.jsx('h2', {
                  className: 'text-2xl font-black text-slate-900',
                  children: u ? `Editar Informe ${s.numero}` : 'Nuevo Informe de Monitoreo'
                })
              ]
            }),
            x &&
              V &&
              e.jsxs('div', {
                className:
                  'sticky top-2 z-20 rounded-2xl border border-emerald-200 bg-emerald-50/95 px-4 py-3 shadow-sm backdrop-blur flex flex-wrap items-center justify-between gap-2',
                children: [
                  e.jsxs('p', {
                    className: 'text-sm font-black text-emerald-800',
                    children: [
                      '🔒 Tarea en proceso por: ',
                      V.name,
                      ' - Desde:',
                      ' ',
                      new Date(V.at).toLocaleTimeString('es-CL', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    ]
                  }),
                  e.jsx('span', {
                    className: 'text-xs font-bold text-emerald-700',
                    children: 'Lease renovable · 15 minutos'
                  })
                ]
              }),
            x &&
              e.jsxs('div', {
                className: 'rounded-2xl border border-slate-200 bg-white p-4',
                children: [
                  e.jsxs('div', {
                    className: 'mb-2 flex items-center justify-between text-sm',
                    children: [
                      e.jsx('span', {
                        className: 'font-black text-slate-700',
                        children: 'Progreso de revisión'
                      }),
                      e.jsxs('span', {
                        className: 'font-black text-emerald-700',
                        children: [re, '/', A.length, ' SKUs · ', ie, '%']
                      })
                    ]
                  }),
                  e.jsx('div', {
                    className: 'h-2.5 overflow-hidden rounded-full bg-slate-100',
                    children: e.jsx('div', {
                      className: 'h-full rounded-full bg-emerald-500 transition-all duration-300',
                      style: { width: `${ie}%` }
                    })
                  })
                ]
              }),
            u &&
              s.estado === 'DICTAMINADO' &&
              e.jsxs('div', {
                className:
                  'flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm',
                children: [
                  e.jsx(fe, { size: 18, className: 'shrink-0 mt-0.5' }),
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
                      value: L,
                      onChange: (i) => v(i.target.value),
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
                      value: b,
                      onChange: (i) => z(i.target.value),
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
                      value: P,
                      onChange: (i) => M(i.target.value),
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
                        e.jsx(ge, {
                          size: 18,
                          className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-300'
                        }),
                        e.jsx('input', {
                          value: R,
                          onChange: (i) => _(i.target.value),
                          onKeyDown: (i) => i.key === 'Enter' && G(),
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
                          checked: o,
                          onChange: (i) => a(i.target.checked)
                        }),
                        'Solo 🔴/🟠 (próx. a vencer)'
                      ]
                    }),
                    e.jsxs('button', {
                      onClick: G,
                      disabled: N,
                      className:
                        'px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700 disabled:opacity-50',
                      children: [
                        N
                          ? e.jsx(pe, { size: 16, className: 'animate-spin' })
                          : e.jsx(ge, { size: 16 }),
                        ' ',
                        'Buscar'
                      ]
                    })
                  ]
                }),
                m.length > 0 &&
                  e.jsx('div', {
                    className:
                      'mt-4 max-h-64 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50',
                    children: m.map((i, T) =>
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
                                  className: `w-2.5 h-2.5 rounded-full ${rs[i.semaforo] || 'bg-slate-300'}`
                                }),
                                e.jsx('span', {
                                  className:
                                    'font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 shrink-0',
                                  children: i.codigo_producto
                                }),
                                e.jsx('span', {
                                  className: 'text-slate-600 truncate',
                                  children: i.producto
                                }),
                                i.partida &&
                                  e.jsxs('span', {
                                    className: 'text-[10px] text-slate-400',
                                    children: ['lote ', i.partida]
                                  }),
                                i.ubicacion &&
                                  e.jsxs('span', {
                                    className: 'text-[10px] text-slate-400',
                                    children: ['· ', i.ubicacion]
                                  })
                              ]
                            }),
                            e.jsx('button', {
                              onClick: () => q(i),
                              className:
                                'ml-3 p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shrink-0',
                              children: e.jsx(Ee, { size: 16 })
                            })
                          ]
                        },
                        T
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
                      children: ['Ítems del informe (', A.length, ')']
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center gap-2',
                      children: [
                        H > 0 &&
                          e.jsxs('span', {
                            className:
                              'text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full flex items-center gap-1',
                            children: [e.jsx(fe, { size: 12 }), ' ', H, ' sin ubicación']
                          }),
                        e.jsxs('button', {
                          type: 'button',
                          onClick: () =>
                            F(
                              J
                                ? null
                                : {
                                    codigo: '',
                                    producto: '',
                                    ubicacion: '',
                                    partida: '',
                                    cantidad: 1
                                  }
                            ),
                          className:
                            'text-xs font-bold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5',
                          children: [e.jsx(Ee, { size: 13 }), ' Agregar manual']
                        })
                      ]
                    })
                  ]
                }),
                A.length > 0 &&
                  e.jsxs('div', {
                    className:
                      'mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3',
                    children: [
                      e.jsxs('label', {
                        className:
                          'mr-auto flex cursor-pointer items-center gap-2 text-xs font-black text-slate-700',
                        children: [
                          e.jsx('input', {
                            type: 'checkbox',
                            checked: W.length === A.length,
                            onChange: de,
                            className: 'h-4 w-4 rounded border-slate-300 accent-emerald-600'
                          }),
                          'Seleccionar todos (',
                          W.length,
                          '/',
                          A.length,
                          ')'
                        ]
                      }),
                      e.jsx('button', {
                        type: 'button',
                        onClick: () => te('APROBADO'),
                        className:
                          'rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700',
                        children: 'Aprobar seleccionados'
                      }),
                      e.jsx('button', {
                        type: 'button',
                        onClick: () => te('RECHAZADO'),
                        className:
                          'rounded-lg bg-rose-600 px-3 py-2 text-xs font-black text-white hover:bg-rose-700',
                        children: 'Rechazar seleccionados'
                      })
                    ]
                  }),
                J &&
                  e.jsxs('div', {
                    className: 'mb-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center gap-2 mb-3 text-amber-800',
                        children: [
                          e.jsx(fe, { size: 15 }),
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
                                value: J.codigo,
                                onChange: (i) =>
                                  F((T) => ({ ...T, codigo: i.target.value.toUpperCase() })),
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
                                value: J.ubicacion,
                                onChange: (i) =>
                                  F((T) => ({ ...T, ubicacion: i.target.value.toUpperCase() })),
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
                                value: J.partida,
                                onChange: (i) =>
                                  F((T) => ({ ...T, partida: i.target.value.toUpperCase() })),
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
                                value: J.cantidad,
                                onChange: (i) =>
                                  F((T) => ({ ...T, cantidad: Number(i.target.value) || 0 })),
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
                                value: J.producto,
                                onChange: (i) => F((T) => ({ ...T, producto: i.target.value })),
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
                          e.jsx(fe, { size: 12 }),
                          ' Al enviar a Calidad se generará una alerta a Inventario para dar de alta este ítem.'
                        ]
                      }),
                      e.jsxs('div', {
                        className: 'flex justify-end gap-2 mt-3',
                        children: [
                          e.jsx('button', {
                            onClick: () => F(null),
                            className:
                              'px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-white',
                            children: 'Cancelar'
                          }),
                          e.jsxs('button', {
                            onClick: le,
                            className:
                              'px-4 py-2 rounded-xl bg-amber-600 text-white font-black text-sm hover:bg-amber-700 flex items-center gap-1.5',
                            children: [e.jsx(Ee, { size: 15 }), ' Agregar']
                          })
                        ]
                      })
                    ]
                  }),
                A.length === 0
                  ? e.jsx('p', {
                      className: 'text-sm text-slate-400 py-6 text-center',
                      children: 'Busca y agrega productos al informe.'
                    })
                  : e.jsx('div', {
                      className: 'space-y-3',
                      children: A.map((i) => {
                        const T = i.condicion_observada !== 'OK',
                          B = !(i.ubicacion || '').trim();
                        return e.jsxs(
                          'div',
                          {
                            className: `rounded-xl border p-4 ${T ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`,
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-start justify-between gap-3 mb-3',
                                children: [
                                  e.jsxs('label', {
                                    className:
                                      'mt-0.5 flex cursor-pointer items-start gap-3 min-w-0',
                                    children: [
                                      e.jsx('input', {
                                        type: 'checkbox',
                                        checked: W.includes(i._key),
                                        onChange: () => ee(i._key),
                                        className:
                                          'mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-emerald-600'
                                      }),
                                      e.jsxs('div', {
                                        className: 'min-w-0',
                                        children: [
                                          e.jsxs('div', {
                                            className: 'flex items-center gap-2 flex-wrap',
                                            children: [
                                              e.jsx('span', {
                                                className: `w-2 h-2 rounded-full ${rs[i.semaforo] || 'bg-slate-300'}`
                                              }),
                                              e.jsx('span', {
                                                className:
                                                  'font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-100',
                                                children: i.codigo_producto
                                              }),
                                              i.no_registrado &&
                                                e.jsx('span', {
                                                  className:
                                                    'text-[9px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded uppercase tracking-wide',
                                                  children: 'No registrado'
                                                }),
                                              e.jsx('span', {
                                                className: 'text-sm text-slate-600 truncate',
                                                children: i.producto
                                              })
                                            ]
                                          }),
                                          e.jsxs('span', {
                                            className: 'text-[10px] text-slate-400',
                                            children: [
                                              i.unidad_medida || 'UN',
                                              i.fecha_vencimiento
                                                ? ` · vence ${i.fecha_vencimiento}`
                                                : ''
                                            ]
                                          })
                                        ]
                                      })
                                    ]
                                  }),
                                  e.jsx('button', {
                                    onClick: () => Q(i._key),
                                    className:
                                      'p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 shrink-0',
                                    children: e.jsx(he, { size: 15 })
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3',
                                children: [
                                  e.jsx('div', {
                                    className: 'col-span-2',
                                    children: e.jsx(Mt, { item: i, onChange: (r) => me(i._key, r) })
                                  }),
                                  e.jsxs('div', {
                                    className: 'col-span-2',
                                    children: [
                                      e.jsxs('label', {
                                        className:
                                          'text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1',
                                        children: [
                                          'Ubicación ',
                                          B &&
                                            e.jsx('span', {
                                              className: 'text-rose-500',
                                              children: '*obligatoria'
                                            })
                                        ]
                                      }),
                                      e.jsx('input', {
                                        value: i.ubicacion,
                                        onChange: (r) =>
                                          ae(i._key, 'ubicacion', r.target.value.toUpperCase()),
                                        placeholder: 'Ej. A-12-03',
                                        className: `w-full mt-1 px-3 py-2 rounded-xl border text-sm font-mono font-bold outline-none focus:border-emerald-400 ${B ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'}`
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
                                        value: i.cantidad,
                                        onChange: (r) =>
                                          ae(i._key, 'cantidad', Number(r.target.value) || 0),
                                        className:
                                          'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400'
                                      })
                                    ]
                                  }),
                                  T &&
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
                                          max: i.cantidad,
                                          value: i.cantidad_afectada,
                                          onChange: (r) =>
                                            ae(
                                              i._key,
                                              'cantidad_afectada',
                                              Number(r.target.value) || 0
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
                                    children: et.map((r) =>
                                      e.jsxs(
                                        'button',
                                        {
                                          type: 'button',
                                          onClick: () => I(i._key, r),
                                          className: `text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${be(r, i.condicion_observada === r)}`,
                                          children: [
                                            r !== 'OK' &&
                                              i.condicion_observada === r &&
                                              e.jsx(fe, {
                                                size: 11,
                                                className: 'inline mr-1 -mt-0.5'
                                              }),
                                            r
                                          ]
                                        },
                                        r
                                      )
                                    )
                                  })
                                ]
                              }),
                              e.jsx('div', {
                                className: 'flex flex-col sm:flex-row gap-2',
                                children: e.jsx('input', {
                                  value: i.observaciones,
                                  onChange: (r) => ae(i._key, 'observaciones', r.target.value),
                                  placeholder: 'Nota / observación',
                                  className:
                                    'flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400'
                                })
                              }),
                              T &&
                                !B &&
                                e.jsxs('p', {
                                  className:
                                    'mt-2 text-[11px] text-amber-700 bg-amber-100/60 rounded-lg px-3 py-1.5 flex items-center gap-1.5',
                                  children: [
                                    e.jsx(fe, { size: 12 }),
                                    ' Al enviar,',
                                    ' ',
                                    e.jsx('b', { className: 'font-mono', children: i.ubicacion }),
                                    ' se marcará "En Auditoría" en Ubicaciones.'
                                  ]
                                })
                            ]
                          },
                          i._key
                        );
                      })
                    }),
                e.jsxs('div', {
                  className: 'flex justify-end gap-3 mt-5',
                  children: [
                    !x &&
                      e.jsx('button', {
                        onClick: () => $(u ? s.estado : 'BORRADOR'),
                        disabled: ue,
                        className:
                          'px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 disabled:opacity-50',
                        children: u ? 'Guardar cambios' : 'Guardar borrador'
                      }),
                    !u &&
                      e.jsxs('button', {
                        onClick: () => $('ENVIADO_CALIDAD'),
                        disabled: ue,
                        className:
                          'px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50',
                        children: [
                          ue
                            ? e.jsx(pe, { size: 16, className: 'animate-spin' })
                            : e.jsx(Us, { size: 16 }),
                          ' Enviar a Calidad'
                        ]
                      })
                  ]
                }),
                x &&
                  e.jsx('div', {
                    className: `mt-4 text-right text-xs font-bold ${oe.status === 'error' ? 'text-rose-600' : 'text-slate-500'}`,
                    children:
                      oe.status === 'saving' || oe.status === 'pending'
                        ? '⏳ Guardando...'
                        : oe.status === 'error'
                          ? `🔴 No se pudo autoguardar: ${oe.error}`
                          : oe.savedAt
                            ? `🟢 Todos los cambios guardados - ${new Date(oe.savedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
                            : 'Autoguardado listo'
                  })
              ]
            })
          ]
        });
  },
  zs = {
    clasificacion: Qs[0],
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
  $s = ({ informe: s, prefill: d, onCancel: l, onSaved: c }) => {
    var X;
    const { user: E } = ye(),
      h = st(),
      { data: t } = gs((s == null ? void 0 : s.id) || null),
      g =
        !s && d
          ? {
              antecedentes: `Recepción ${d.oc || 's/OC'} de ${d.proveedor || 's/proveedor'} (${d.origen === 'NACIONAL' ? 'Nacional' : 'Importación'}) resultó NO CONFORME en el CheckList de ingreso. Se levanta el presente Informe de Daños / Solicitud de No Conformidad al proveedor.`,
              fecha_recepcion: d.fecha_recepcion || zs.fecha_recepcion
            }
          : {},
      [u, w] = f.useState((s == null ? void 0 : s.id) || null),
      [p, O] = f.useState((s == null ? void 0 : s.numero) || ''),
      [x, L] = f.useState((s == null ? void 0 : s.bodega) || ''),
      [v, b] = f.useState((s == null ? void 0 : s.estado) || 'BORRADOR'),
      [z, P] = f.useState({
        ...zs,
        ...((s == null ? void 0 : s.reporte) || {}),
        ...g,
        elaborado_por:
          ((X = s == null ? void 0 : s.reporte) == null ? void 0 : X.elaborado_por) ||
          (E == null ? void 0 : E.nombre) ||
          ''
      }),
      [M, R] = f.useState([]),
      { data: _ = [], refetch: o } = at(u),
      a = f.useRef(!1);
    f.useEffect(() => {
      s != null &&
        s.id &&
        t &&
        !a.current &&
        ((a.current = !0),
        R(
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
    const m = (y, G) => P((q) => ({ ...q, [y]: G })),
      n = () =>
        R((y) => [
          ...y,
          {
            _key: `tmp-${Lt()}`,
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
      N = (y, G, q) => R((le) => le.map((ae) => (ae._key === y ? { ...ae, [G]: q } : ae))),
      j = (y) => R((G) => G.filter((q) => q._key !== y)),
      A = () =>
        P((y) => ({
          ...y,
          cuadro_resumen: [...(y.cuadro_resumen || []), { indicador: '', valor: '' }]
        })),
      Y = (y, G, q) =>
        P((le) => ({
          ...le,
          cuadro_resumen: le.cuadro_resumen.map((ae, me) => (me === y ? { ...ae, [G]: q } : ae))
        })),
      J = (y) => P((G) => ({ ...G, cuadro_resumen: G.cuadro_resumen.filter((q, le) => le !== y) })),
      F = () =>
        P((y) => ({ ...y, acciones_recomendadas: [...(y.acciones_recomendadas || []), ''] })),
      W = (y, G) =>
        P((q) => ({
          ...q,
          acciones_recomendadas: q.acciones_recomendadas.map((le, ae) => (ae === y ? G : le))
        })),
      Z = (y) =>
        P((G) => ({
          ...G,
          acciones_recomendadas: G.acciones_recomendadas.filter((q, le) => le !== y)
        })),
      ne = async (y) => {
        const G = y || v;
        try {
          const q = u
              ? {
                  bodega: x || null,
                  periodicidad: 'ADHOC',
                  estado: G,
                  observaciones: z.descripcion_hallazgo || null
                }
              : {
                  fecha: new Date().toISOString().slice(0, 10),
                  analista_id: (E == null ? void 0 : E.id) || null,
                  analista_nombre: (E == null ? void 0 : E.nombre) || null,
                  bodega: x || null,
                  periodicidad: 'ADHOC',
                  estado: G,
                  observaciones: z.descripcion_hallazgo || null
                },
            le = M.map(({ _key: me, ...I }) => I),
            ae = await h.mutateAsync({ informeId: u, cabecera: q, reporte: z, hallazgos: le });
          (w(ae.id),
            ae.numero && O(ae.numero),
            b(G),
            R(ae.hallazgos.map((me) => ({ ...me, _key: me.id }))),
            o(),
            S.success('Informe de daños guardado'));
        } catch (q) {
          S.error(`Error al guardar: ${q.message}`);
        }
      },
      xe = {
        id: u,
        numero: p,
        fecha: (s == null ? void 0 : s.fecha) || z.fecha_recepcion,
        bodega: x,
        analista_nombre: z.elaborado_por || (E == null ? void 0 : E.nombre),
        reporte: z
      },
      oe = async (y) => {
        if (!u) {
          S.error('Guarda el informe antes de exportar');
          return;
        }
        try {
          y === 'word' ? await vt(xe, M, _) : await _t(xe, M, _);
        } catch (G) {
          S.error(`Error al exportar: ${G.message}`);
        }
      },
      D =
        'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-400',
      V = 'text-[10px] font-black text-slate-400 uppercase tracking-widest',
      se = (y) => _.filter((G) => G.item_id === y);
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
                  onClick: l,
                  className:
                    'p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm',
                  children: e.jsx(Ie, { size: 22 })
                }),
                e.jsx('h2', {
                  className: 'text-2xl font-black text-slate-900',
                  children: u ? `Informe de Daños ${p}` : 'Nuevo Informe de Daños'
                })
              ]
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-2',
              children: [
                e.jsxs('button', {
                  onClick: () => oe('word'),
                  disabled: !u,
                  className:
                    'px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-blue-700 disabled:opacity-40',
                  children: [e.jsx(De, { size: 16 }), ' Word']
                }),
                e.jsxs('button', {
                  onClick: () => oe('pdf'),
                  disabled: !u,
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
                e.jsx('label', { className: V, children: 'Fecha de recepción' }),
                e.jsx('input', {
                  type: 'date',
                  value: z.fecha_recepcion || '',
                  onChange: (y) => m('fecha_recepcion', y.target.value),
                  className: D
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: V, children: 'Tipo de producto' }),
                e.jsx('input', {
                  value: z.tipo_producto,
                  onChange: (y) => m('tipo_producto', y.target.value),
                  placeholder: 'Ej. Biombos (divisores modulares)',
                  className: D
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: V, children: 'Área responsable' }),
                e.jsx('input', {
                  value: z.area_responsable,
                  onChange: (y) => m('area_responsable', y.target.value),
                  className: D
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: V, children: 'Clasificación' }),
                e.jsx('select', {
                  value: z.clasificacion,
                  onChange: (y) => m('clasificacion', y.target.value),
                  className: D,
                  children: Qs.map((y) => e.jsx('option', { value: y, children: y }, y))
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: V, children: 'Bodega' }),
                e.jsx('input', {
                  value: x,
                  onChange: (y) => L(y.target.value),
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
                e.jsx('label', { className: V, children: '1. Antecedentes' }),
                e.jsx('textarea', {
                  rows: 3,
                  value: z.antecedentes,
                  onChange: (y) => m('antecedentes', y.target.value),
                  className: D
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: V, children: '2. Descripción del hallazgo' }),
                e.jsx('textarea', {
                  rows: 3,
                  value: z.descripcion_hallazgo,
                  onChange: (y) => m('descripcion_hallazgo', y.target.value),
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
                  children: ['3. Daños identificados (', M.length, ')']
                }),
                e.jsxs('button', {
                  onClick: n,
                  className:
                    'px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-slate-700',
                  children: [e.jsx(Ee, { size: 14 }), ' Agregar hallazgo']
                })
              ]
            }),
            M.length === 0
              ? e.jsx('p', {
                  className: 'text-sm text-slate-400 py-6 text-center',
                  children: 'Agrega los hallazgos de daño con sus fotos de evidencia.'
                })
              : e.jsx('div', {
                  className: 'space-y-4',
                  children: M.map((y, G) =>
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
                                children: ['Hallazgo 3.', G + 1]
                              }),
                              e.jsx('button', {
                                onClick: () => j(y._key),
                                className:
                                  'p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50',
                                children: e.jsx(he, { size: 15 })
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'grid grid-cols-1 sm:grid-cols-3 gap-3',
                            children: [
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', { className: V, children: 'Tipo de daño' }),
                                  e.jsx('input', {
                                    value: y.tipo_dano,
                                    onChange: (q) => N(y._key, 'tipo_dano', q.target.value),
                                    placeholder: 'Deformación por aplastamiento',
                                    className: D
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', { className: V, children: 'Componente afectado' }),
                                  e.jsx('input', {
                                    value: y.componente_afectado,
                                    onChange: (q) =>
                                      N(y._key, 'componente_afectado', q.target.value),
                                    placeholder: 'Pilar / Panel',
                                    className: D
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', { className: V, children: 'Cantidad afectada' }),
                                  e.jsx('input', {
                                    type: 'number',
                                    value: y.cantidad,
                                    onChange: (q) => N(y._key, 'cantidad', q.target.value),
                                    className: D
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', {
                                    className: V,
                                    children: 'Producto / SKU (opcional)'
                                  }),
                                  e.jsx('input', {
                                    value: y.codigo_producto,
                                    onChange: (q) => N(y._key, 'codigo_producto', q.target.value),
                                    placeholder: 'SKU',
                                    className: D
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', {
                                    className: V,
                                    children: 'Ubicación (opcional)'
                                  }),
                                  e.jsx('input', {
                                    value: y.ubicacion,
                                    onChange: (q) => N(y._key, 'ubicacion', q.target.value),
                                    className: D
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', { className: V, children: 'Lote (opcional)' }),
                                  e.jsx('input', {
                                    value: y.partida,
                                    onChange: (q) => N(y._key, 'partida', q.target.value),
                                    className: D
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'sm:col-span-3',
                                children: [
                                  e.jsx('label', { className: V, children: 'Consecuencia' }),
                                  e.jsx('input', {
                                    value: y.consecuencia,
                                    onChange: (q) => N(y._key, 'consecuencia', q.target.value),
                                    placeholder: 'No apto para despacho hasta evaluación técnica',
                                    className: D
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'sm:col-span-3',
                                children: [
                                  e.jsx('label', { className: V, children: 'Observaciones' }),
                                  e.jsx('input', {
                                    value: y.observaciones,
                                    onChange: (q) => N(y._key, 'observaciones', q.target.value),
                                    className: D
                                  })
                                ]
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'mt-3',
                            children: [
                              e.jsx('label', { className: V, children: 'Evidencia fotográfica' }),
                              e.jsx('div', {
                                className: 'mt-1.5',
                                children: e.jsx(kt, {
                                  informeId: u,
                                  itemId: y.id,
                                  evidencias: se(y.id),
                                  onChanged: o
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
                  onClick: A,
                  className:
                    'px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-slate-700',
                  children: [e.jsx(Ee, { size: 14 }), ' Fila']
                })
              ]
            }),
            e.jsx('div', {
              className: 'space-y-2',
              children: (z.cuadro_resumen || []).map((y, G) =>
                e.jsxs(
                  'div',
                  {
                    className: 'flex gap-2 items-center',
                    children: [
                      e.jsx('input', {
                        value: y.indicador,
                        onChange: (q) => Y(G, 'indicador', q.target.value),
                        placeholder: 'Indicador (ej. Total de bultos recepcionados)',
                        className: `${D} mt-0 flex-1`
                      }),
                      e.jsx('input', {
                        value: y.valor,
                        onChange: (q) => Y(G, 'valor', q.target.value),
                        placeholder: 'Valor',
                        className: `${D} mt-0 w-32`
                      }),
                      e.jsx('button', {
                        onClick: () => J(G),
                        className:
                          'p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50',
                        children: e.jsx(he, { size: 15 })
                      })
                    ]
                  },
                  G
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
                e.jsx('label', { className: V, children: '5. Análisis y causa probable' }),
                e.jsx('textarea', {
                  rows: 3,
                  value: z.analisis_causa,
                  onChange: (y) => m('analisis_causa', y.target.value),
                  className: D
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsx('label', { className: V, children: '6. Acciones recomendadas' }),
                    e.jsxs('button', {
                      onClick: F,
                      className:
                        'px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-slate-700',
                      children: [e.jsx(Ee, { size: 14 }), ' Acción']
                    })
                  ]
                }),
                e.jsx('div', {
                  className: 'space-y-2 mt-1.5',
                  children: (z.acciones_recomendadas || []).map((y, G) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'flex gap-2 items-center',
                        children: [
                          e.jsx('input', {
                            value: y,
                            onChange: (q) => W(G, q.target.value),
                            placeholder: 'Acción recomendada',
                            className: `${D} mt-0 flex-1`
                          }),
                          e.jsx('button', {
                            onClick: () => Z(G),
                            className:
                              'p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50',
                            children: e.jsx(he, { size: 15 })
                          })
                        ]
                      },
                      G
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
                e.jsx('label', { className: V, children: 'Elaborado por' }),
                e.jsx('input', {
                  value: z.elaborado_por,
                  onChange: (y) => m('elaborado_por', y.target.value),
                  className: D
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: V, children: 'Revisado por' }),
                e.jsx('input', {
                  value: z.revisado_por,
                  onChange: (y) => m('revisado_por', y.target.value),
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
              onClick: () => ne('BORRADOR'),
              disabled: h.isPending,
              className:
                'px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2',
              children: [
                h.isPending
                  ? e.jsx(pe, { size: 16, className: 'animate-spin' })
                  : e.jsx(ja, { size: 16 }),
                ' ',
                'Guardar'
              ]
            }),
            e.jsxs('button', {
              onClick: () => ne('ENVIADO_CALIDAD'),
              disabled: h.isPending,
              className:
                'px-5 py-2.5 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center gap-2 hover:bg-rose-700 disabled:opacity-50',
              children: [e.jsx(Us, { size: 16 }), ' Guardar y enviar']
            })
          ]
        })
      ]
    });
  },
  Bt = ({ informe: s, onBack: d, onEdit: l, onDelete: c }) => {
    var _;
    const { hasPermission: E } = ye(),
      h = E('manage_quality'),
      { data: t = [], isLoading: g } = gs(s.id),
      u = tt(),
      w = ot(),
      { data: p = [] } = rt(),
      { data: O = [] } = nt(),
      x = lt(),
      [L, v] = f.useState({}),
      b = (o, a) => v((m) => ({ ...m, [o]: { ...m[o], ...a } })),
      z = async (o) => {
        var n;
        const a = L[o.id] || {};
        if (!a.dictamen) {
          S.error('Selecciona un dictamen');
          return;
        }
        const m = Ve.find((N) => N.id === a.dictamen);
        if (m != null && m.mueve && !a.bodegaDestino) {
          S.error('Indica la bodega destino');
          return;
        }
        if (a.tipoAccion) {
          const N = Ge.find((j) => j.id === a.tipoAccion);
          if (!(a.area || (N != null && N.area))) {
            S.error('Selecciona el área responsable de la acción');
            return;
          }
        }
        try {
          if (
            (await u.mutateAsync({
              itemId: o.id,
              dictamen: a.dictamen,
              bodegaDestino: a.bodegaDestino,
              acuse: a.acuse
            }),
            S.success(
              `Dictamen registrado: ${m == null ? void 0 : m.label}${m != null && m.mueve ? ' · aviso enviado a Inventario' : ''}`
            ),
            ['CUARENTENA', 'RECHAZAR', 'BAJA'].includes(a.dictamen) &&
              mt({
                codigo: o.codigo_producto,
                ubicacion: o.ubicacion,
                estadoLabel: (m == null ? void 0 : m.label) || a.dictamen,
                tipo: 'CALIDAD_DICTAMEN'
              }),
            a.tipoAccion)
          ) {
            const N = Ge.find((A) => A.id === a.tipoAccion),
              j = a.area || (N == null ? void 0 : N.area);
            if (!j) {
              S.error('Selecciona el área responsable de la acción');
              return;
            }
            try {
              const A = await w.mutateAsync({
                itemId: o.id,
                tipoAccion: a.tipoAccion,
                area: j,
                descripcion: a.descAccion,
                prioridad: a.prioridad || 'NORMAL'
              });
              S.success(
                `Acción promulgada ${(A == null ? void 0 : A.folio) || ''} → ${((n = p.find((Y) => Y.codigo === j)) == null ? void 0 : n.label) || j}`
              );
            } catch (A) {
              S.error(`Dictamen OK, pero no se pudo crear la acción: ${A.message}`);
            }
          }
        } catch (N) {
          S.error(`Error: ${N.message}`);
        }
      },
      P = () => {
        const o = t.map((j) => ({
            SKU: j.codigo_producto,
            Lote_Serie: j.partida,
            Ubicacion: j.ubicacion,
            Producto: j.producto,
            UM: j.unidad_medida,
            Cantidad: j.cantidad,
            Uds_Afectadas: j.cantidad_afectada || 0,
            No_Registrado: j.no_registrado ? 'SÍ' : '',
            Estado_Inv: j.estado_inventario,
            Tipo: j.tipo,
            Vence: j.fecha_vencimiento,
            Semaforo: j.semaforo,
            Condicion: j.condicion_observada,
            Motivo: j.motivo,
            Observaciones: j.observaciones,
            Dictamen: j.dictamen || '',
            Bodega_Destino: j.bodega_destino || '',
            Acuse: j.acuse_texto || '',
            Calidad: j.calidad_nombre || '',
            Fecha_Dictamen: j.fecha_dictamen || ''
          })),
          a = (j) => t.filter(j).length,
          m = ['LIBERAR', 'CUARENTENA', 'REPROCESO', 'RECHAZAR', 'BAJA'],
          n = [...new Set(t.map((j) => j.condicion_observada).filter(Boolean))],
          N = [
            { Campo: 'Informe', Valor: s.numero },
            { Campo: 'Fecha', Valor: s.fecha },
            { Campo: 'Bodega', Valor: s.bodega || '—' },
            { Campo: 'Analista', Valor: s.analista_nombre || '—' },
            { Campo: 'Estado', Valor: s.estado },
            { Campo: 'Total ítems', Valor: t.length },
            { Campo: 'Dictaminados', Valor: a((j) => j.dictamen) },
            { Campo: 'Pendientes', Valor: a((j) => !j.dictamen) },
            {
              Campo: 'Con problema (cond≠OK)',
              Valor: a((j) => j.condicion_observada && j.condicion_observada !== 'OK')
            },
            { Campo: 'No registrados', Valor: a((j) => j.no_registrado) },
            { Campo: '— Por semáforo —', Valor: '' },
            ...['ROJO', 'NARANJA', 'VERDE', 'NA'].map((j) => ({
              Campo: `Semáforo ${j}`,
              Valor: a((A) => A.semaforo === j)
            })),
            { Campo: '— Por dictamen —', Valor: '' },
            ...m.map((j) => ({ Campo: j, Valor: a((A) => A.dictamen === j) })),
            { Campo: '— Por condición —', Valor: '' },
            ...n.map((j) => ({ Campo: j, Valor: a((A) => A.condicion_observada === j) }))
          ];
        ya({
          filename: `Monitoreo_${s.numero}`,
          sheets: [
            { name: 'Resumen', rows: N },
            { name: 'Detalle', rows: o }
          ]
        });
      },
      M = f.useMemo(() => t.filter((o) => !o.dictamen).length, [t]),
      R = f.useMemo(() => {
        const o = t.length,
          a = t.filter((j) => j.dictamen).length,
          m = t.filter((j) => j.no_registrado).length,
          n = t.filter((j) => j.condicion_observada && j.condicion_observada !== 'OK').length,
          N = { ROJO: 0, NARANJA: 0, VERDE: 0, NA: 0 };
        return (
          t.forEach((j) => {
            N[j.semaforo] = (N[j.semaforo] || 0) + 1;
          }),
          {
            total: o,
            dictaminados: a,
            noReg: m,
            conProblema: n,
            sem: N,
            pct: o ? Math.round((a / o) * 100) : 0
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
                  onClick: d,
                  className:
                    'p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm',
                  children: e.jsx(Ie, { size: 22 })
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
                          className: `text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${la[s.estado] || ''}`,
                          children: (_ = s.estado) == null ? void 0 : _.replace('_', ' ')
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
                        M,
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
                l &&
                  e.jsxs('button', {
                    onClick: () => l(s),
                    className:
                      'px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-50',
                    children: [e.jsx(Bs, { size: 16 }), ' Editar']
                  }),
                c &&
                  e.jsxs('button', {
                    onClick: () => c(s),
                    className:
                      'px-4 py-2.5 bg-white border border-slate-200 text-rose-600 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-rose-50',
                    children: [e.jsx(he, { size: 16 }), ' Eliminar']
                  }),
                e.jsxs('button', {
                  onClick: () => yt(s, t),
                  title: 'Descargar Word',
                  className:
                    'px-3 py-2.5 bg-white border border-slate-200 text-blue-700 rounded-xl text-sm font-black flex items-center gap-1.5 hover:bg-blue-50',
                  children: [e.jsx(De, { size: 16 }), ' Word']
                }),
                e.jsxs('button', {
                  onClick: () => Ct(s, t),
                  title: 'Descargar PDF',
                  className:
                    'px-3 py-2.5 bg-white border border-slate-200 text-rose-700 rounded-xl text-sm font-black flex items-center gap-1.5 hover:bg-rose-50',
                  children: [e.jsx(Gs, { size: 16 }), ' PDF']
                }),
                e.jsxs('button', {
                  onClick: P,
                  className:
                    'px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700',
                  children: [e.jsx(va, { size: 16 }), ' Excel']
                })
              ]
            })
          ]
        }),
        !g &&
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
                    children: [R.dictaminados, '/', R.total, ' · ', R.pct, '%']
                  })
                ]
              }),
              e.jsx('div', {
                className: 'h-2 bg-slate-100 rounded-full overflow-hidden mb-4',
                children: e.jsx('div', {
                  className: 'h-full bg-emerald-500 transition-all',
                  style: { width: `${R.pct}%` }
                })
              }),
              e.jsx('div', {
                className: 'grid grid-cols-2 sm:grid-cols-5 gap-3',
                children: [
                  { label: 'Ítems', value: R.total, cls: 'text-slate-900' },
                  { label: 'Dictaminados', value: R.dictaminados, cls: 'text-emerald-600' },
                  { label: 'Pendientes', value: M, cls: 'text-amber-600' },
                  { label: 'Con problema', value: R.conProblema, cls: 'text-orange-600' },
                  { label: 'No registrados', value: R.noReg, cls: 'text-rose-600' }
                ].map((o) =>
                  e.jsxs(
                    'div',
                    {
                      className: 'bg-slate-50 rounded-xl px-3 py-2.5',
                      children: [
                        e.jsx('div', {
                          className:
                            'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                          children: o.label
                        }),
                        e.jsx('div', {
                          className: `text-2xl font-black tabular-nums ${o.cls}`,
                          children: o.value
                        })
                      ]
                    },
                    o.label
                  )
                )
              }),
              e.jsxs('div', {
                className: 'flex flex-wrap gap-2 mt-3',
                children: [
                  R.sem.ROJO > 0 &&
                    e.jsxs('span', {
                      className:
                        'text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1',
                      children: [
                        e.jsx('span', { className: 'w-2 h-2 rounded-full bg-rose-500' }),
                        ' ',
                        R.sem.ROJO,
                        ' vence <30d'
                      ]
                    }),
                  R.sem.NARANJA > 0 &&
                    e.jsxs('span', {
                      className:
                        'text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1',
                      children: [
                        e.jsx('span', { className: 'w-2 h-2 rounded-full bg-amber-500' }),
                        ' ',
                        R.sem.NARANJA,
                        ' vence <90d'
                      ]
                    }),
                  R.sem.VERDE > 0 &&
                    e.jsxs('span', {
                      className:
                        'text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1',
                      children: [
                        e.jsx('span', { className: 'w-2 h-2 rounded-full bg-emerald-500' }),
                        ' ',
                        R.sem.VERDE,
                        ' vigente'
                      ]
                    })
                ]
              })
            ]
          }),
        g
          ? e.jsx('div', {
              className: 'flex justify-center py-16',
              children: e.jsx(pe, { className: 'animate-spin text-emerald-500', size: 32 })
            })
          : e.jsx('div', {
              className: 'space-y-3',
              children: t.map((o) => {
                const a = L[o.id] || {},
                  m = Ve.find((n) => n.id === a.dictamen);
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
                                className: `w-2.5 h-2.5 rounded-full ${rs[o.semaforo] || 'bg-slate-300'}`
                              }),
                              e.jsx('span', {
                                className:
                                  'font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100',
                                children: o.codigo_producto
                              }),
                              o.no_registrado &&
                                e.jsx('span', {
                                  className:
                                    'text-[9px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded uppercase tracking-wide',
                                  children: 'No registrado'
                                }),
                              e.jsx('span', {
                                className: 'text-slate-600 truncate',
                                children: o.producto
                              }),
                              e.jsxs('span', {
                                className: 'text-[10px] text-slate-400',
                                children: [
                                  'lote ',
                                  o.partida || '—',
                                  ' · ',
                                  o.ubicacion || 's/ubic',
                                  ' · ',
                                  o.cantidad,
                                  ' uds'
                                ]
                              })
                            ]
                          }),
                          o.dictamen
                            ? e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  e.jsx(pt, { estado: Ut(o.dictamen) }),
                                  e.jsxs('span', {
                                    className: 'text-xs font-bold text-slate-500',
                                    children: [
                                      o.dictamen,
                                      o.bodega_destino ? ` → BD ${o.bodega_destino}` : '',
                                      ' ·',
                                      ' ',
                                      o.calidad_nombre
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
                                  o.condicion_observada && o.condicion_observada !== 'OK'
                                    ? 'text-amber-700'
                                    : 'text-slate-700',
                                children: o.condicion_observada || '—'
                              })
                            ]
                          }),
                          Number(o.cantidad_afectada) > 0 &&
                            e.jsxs('span', {
                              children: [
                                'Afectadas: ',
                                e.jsxs('b', {
                                  className: 'text-amber-700',
                                  children: [o.cantidad_afectada, ' uds']
                                })
                              ]
                            }),
                          e.jsxs('span', {
                            children: [
                              'Motivo: ',
                              e.jsx('b', { className: 'text-slate-700', children: o.motivo || '—' })
                            ]
                          }),
                          o.observaciones &&
                            e.jsxs('span', {
                              children: [
                                'Obs: ',
                                e.jsx('b', {
                                  className: 'text-slate-700',
                                  children: o.observaciones
                                })
                              ]
                            })
                        ]
                      }),
                      h &&
                        !o.dictamen &&
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
                                  value: a.dictamen || '',
                                  onChange: (n) => b(o.id, { dictamen: n.target.value }),
                                  className:
                                    'block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400',
                                  children: [
                                    e.jsx('option', { value: '', children: '— Elegir —' }),
                                    Ve.map((n) =>
                                      e.jsx('option', { value: n.id, children: n.label }, n.id)
                                    )
                                  ]
                                })
                              ]
                            }),
                            (m == null ? void 0 : m.mueve) &&
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', {
                                    className:
                                      'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                                    children: 'Bodega destino (Softland)'
                                  }),
                                  e.jsxs('select', {
                                    value: a.bodegaDestino || '',
                                    onChange: (n) => b(o.id, { bodegaDestino: n.target.value }),
                                    className:
                                      'block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400',
                                    children: [
                                      e.jsx('option', { value: '', children: '— Elegir —' }),
                                      O.map((n) =>
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
                                      O.length === 0 &&
                                        it.map((n) =>
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
                                  value: a.acuse || '',
                                  onChange: (n) => b(o.id, { acuse: n.target.value }),
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
                                  value: a.tipoAccion || '',
                                  onChange: (n) => {
                                    const N = Ge.find((j) => j.id === n.target.value);
                                    b(o.id, {
                                      tipoAccion: n.target.value,
                                      area: (N == null ? void 0 : N.area) || a.area
                                    });
                                  },
                                  className:
                                    'block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400',
                                  children: [
                                    e.jsx('option', { value: '', children: '— Ninguna —' }),
                                    Ge.map((n) =>
                                      e.jsx('option', { value: n.id, children: n.label }, n.id)
                                    )
                                  ]
                                })
                              ]
                            }),
                            a.tipoAccion &&
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
                                        value: a.area || '',
                                        onChange: (n) => b(o.id, { area: n.target.value }),
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
                                        value: a.prioridad || 'NORMAL',
                                        onChange: (n) => b(o.id, { prioridad: n.target.value }),
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
                                        value: a.descAccion || '',
                                        onChange: (n) => b(o.id, { descAccion: n.target.value }),
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
                              onClick: () => z(o),
                              disabled: u.isPending || w.isPending,
                              className:
                                'px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50',
                              children: [e.jsx(Le, { size: 16 }), ' Dictaminar']
                            })
                          ]
                        })
                    ]
                  },
                  o.id
                );
              })
            }),
        h &&
          s.estado === 'ENVIADO_CALIDAD' &&
          M === 0 &&
          t.length > 0 &&
          e.jsx('div', {
            className: 'flex justify-end',
            children: e.jsxs('button', {
              onClick: async () => {
                try {
                  (await x.mutateAsync({ informeId: s.id, estado: 'DICTAMINADO' }),
                    S.success('Informe marcado como dictaminado'),
                    d());
                } catch (o) {
                  S.error(o.message);
                }
              },
              className:
                'px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700',
              children: [e.jsx(_a, { size: 16 }), ' Cerrar dictamen del informe']
            })
          })
      ]
    });
  };
function Ut(s) {
  const d = Ve.find((l) => l.id === s);
  return (d == null ? void 0 : d.estado) || 'LIBERADO';
}
const to = () => {
  const { hasPermission: s, user: d } = ye(),
    l = s('manage_monitoreo') || s('manage_quality'),
    E = (d == null ? void 0 : d.rol) === 'ADMIN' || (d == null ? void 0 : d.es_admin_delegado),
    { data: h = [], isLoading: t } = Ka(),
    g = qa(),
    [u, w] = f.useState('list'),
    [p, O] = f.useState(null),
    [x, L] = f.useState('hito1'),
    [v, b] = f.useState(null),
    [z, P] = f.useState(null),
    [M, R] = f.useState(''),
    _ = Ja(),
    o = Wa(),
    a = Qa(),
    m = f.useMemo(() => {
      const F = M.trim().toLocaleLowerCase('es-CL');
      return F
        ? h.filter((W) =>
            [
              W.numero,
              W.bodega,
              W.analista_nombre,
              W.estado,
              W.tipo_informe,
              JSON.stringify(W.reporte || {})
            ].some((Z) =>
              String(Z || '')
                .toLocaleLowerCase('es-CL')
                .includes(F)
            )
          )
        : h;
    }, [M, h]);
  (Os('tms_calidad_tareas', ['calidad_tareas'], { debounceMs: 400 }),
    Os('tms_calidad_asignaciones', ['calidad_asignaciones'], { debounceMs: 400 }),
    f.useEffect(() => {
      if (u === 'detail' && p) {
        const F = h.find((W) => W.id === p.id);
        F && O(F);
      }
    }, [h]));
  const n = (F) => {
      (O(F), w(F.tipo_informe === 'DANOS' && l ? 'edit-danos' : 'detail'));
    },
    N = (F) => {
      (O(F), w(F.tipo_informe === 'DANOS' ? 'edit-danos' : 'edit'));
    },
    j = async (F) => {
      if (confirm(`¿Eliminar el informe ${F.numero}? Esta acción no se puede deshacer.`))
        try {
          (await g.mutateAsync(F.id),
            S.success('Informe eliminado'),
            (p == null ? void 0 : p.id) === F.id && (O(null), w('list')));
        } catch (W) {
          S.error(`No se pudo eliminar: ${W.message}`);
        }
    },
    A = () => {
      (w('list'), O(null), b(null), P(null));
    },
    Y = (F) => {
      (O(null),
        b({
          proveedor: F.proveedor,
          oc: F.oc,
          origen: F.origen,
          fecha_recepcion: F.fecha_recepcion,
          recepcion_id: F.recepcion_id,
          tarea_id: F.id
        }),
        L('hito2'),
        w('new-danos'));
    },
    J = async (F) => {
      try {
        const W = await Zs(F.id);
        (O(null), P({ ...F, ...W }), L('hito2'), w('new'));
      } catch (W) {
        S.error((W == null ? void 0 : W.message) || 'No se pudo abrir la tarea de Calidad');
      }
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
                children: e.jsx(Ms, { size: 30, strokeWidth: 2.4 })
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
          u === 'list' &&
            x === 'hito2' &&
            l &&
            e.jsxs('div', {
              className: 'flex flex-wrap gap-2',
              children: [
                e.jsxs('button', {
                  onClick: () => {
                    (O(null), w('new'));
                  },
                  className:
                    'px-5 py-3 bg-emerald-600 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700',
                  children: [e.jsx(Ee, { size: 20 }), ' Monitoreo']
                }),
                e.jsxs('button', {
                  onClick: () => {
                    (O(null), w('new-danos'));
                  },
                  className:
                    'px-5 py-3 bg-rose-600 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-rose-600/20 hover:bg-rose-700',
                  children: [e.jsx(fe, { size: 20 }), ' Informe de Daños']
                })
              ]
            })
        ]
      }),
      u === 'list' &&
        e.jsx('div', {
          className: 'flex flex-wrap gap-2 mb-5',
          children: [
            { id: 'hito1', n: 1, label: 'Recepción', sub: 'Ingreso a bodega', icon: Na, badge: _ },
            {
              id: 'hito2',
              n: 2,
              label: 'Estancia',
              sub: 'Producto en almacenamiento',
              icon: is,
              badge: o
            },
            { id: 'hito3', n: 3, label: 'Salida', sub: 'Despacho', icon: Qe, badge: a }
          ].map((F) => {
            const W = F.icon,
              Z = x === F.id;
            return e.jsxs(
              'button',
              {
                onClick: () => L(F.id),
                className: `px-4 py-2.5 rounded-xl font-black text-sm border transition-colors flex items-center gap-2.5 ${Z ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`,
                children: [
                  e.jsx('span', {
                    className: `w-6 h-6 rounded-lg flex items-center justify-center text-[11px] ${Z ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`,
                    children: F.n
                  }),
                  e.jsx(W, { size: 16, className: 'shrink-0' }),
                  e.jsxs('span', {
                    className: 'flex flex-col items-start leading-tight',
                    children: [
                      e.jsx('span', { children: F.label }),
                      e.jsx('span', {
                        className: `text-[9px] font-bold ${Z ? 'text-white/70' : 'text-slate-400'}`,
                        children: F.sub
                      })
                    ]
                  }),
                  F.badge > 0 &&
                    e.jsx('span', {
                      className: `text-[10px] font-black px-2 py-0.5 rounded-full ${Z ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700'}`,
                      children: F.badge
                    })
                ]
              },
              F.id
            );
          })
        }),
      u === 'list' && x === 'hito1' && e.jsx(Rt, { onGenerarDanos: Y }),
      u === 'list' && x === 'hito3' && e.jsx(Tt, {}),
      u === 'new' &&
        e.jsx(Ds, {
          prefillItems: z == null ? void 0 : z.skus,
          asignacion: z,
          onCancel: A,
          onSaved: A
        }),
      u === 'edit' && p && e.jsx(Ds, { informe: p, onCancel: A, onSaved: A }),
      u === 'new-danos' && e.jsx($s, { prefill: v, onCancel: A, onSaved: A }),
      u === 'edit-danos' && p && e.jsx($s, { informe: p, onCancel: A, onSaved: A }),
      u === 'detail' &&
        p &&
        e.jsx(Bt, { informe: p, onBack: A, onEdit: l ? N : null, onDelete: l ? j : null }),
      u === 'list' &&
        x === 'hito2' &&
        e.jsx(Dt, { canAssign: E, canManageQuality: l, onGenerarInforme: J }),
      u === 'list' &&
        x === 'hito2' &&
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
                        children: [m.length, ' / ', h.length]
                      })
                  ]
                }),
                e.jsxs('label', {
                  className: 'relative mt-3 block',
                  children: [
                    e.jsx(ge, {
                      size: 16,
                      className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                    }),
                    e.jsx('input', {
                      value: M,
                      onChange: (F) => R(F.target.value),
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
                  children: e.jsx(pe, { className: 'animate-spin text-emerald-500', size: 36 })
                })
              : h.length === 0
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
                        children: l
                          ? 'Crea el primero con “Monitoreo” o “Informe de Daños”, o desde una asignación de Inventario.'
                          : 'Aún no hay informes generados.'
                      })
                    ]
                  })
                : m.length === 0
                  ? e.jsxs('div', {
                      className:
                        'rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center',
                      children: [
                        e.jsx(ge, { size: 34, className: 'mx-auto mb-3 text-slate-300' }),
                        e.jsx('h3', {
                          className: 'font-bold text-slate-500',
                          children: 'No hay informes que coincidan'
                        }),
                        e.jsx('button', {
                          onClick: () => R(''),
                          className: 'mt-2 text-xs font-black text-sky-600 hover:text-sky-700',
                          children: 'Limpiar búsqueda'
                        })
                      ]
                    })
                  : e.jsx('div', {
                      className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
                      children: m.map((F) => {
                        var Z;
                        const W = F.tipo_informe === 'DANOS';
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
                                    className: `text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0 ${la[F.estado] || ''}`,
                                    children: (Z = F.estado) == null ? void 0 : Z.replace('_', ' ')
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
                                      className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${Rs[F.tipo_informe] || Rs.MONITOREO}`,
                                      children: W ? 'Daños' : 'Monitoreo'
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
                              l &&
                                e.jsxs('div', {
                                  className:
                                    'flex items-center gap-2 mt-4 pt-3 border-t border-slate-100',
                                  children: [
                                    e.jsxs('button', {
                                      onClick: () => N(F),
                                      className:
                                        'flex-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-black flex items-center justify-center gap-1.5 hover:bg-slate-50',
                                      children: [e.jsx(Bs, { size: 14 }), ' Editar']
                                    }),
                                    e.jsxs('button', {
                                      onClick: () => j(F),
                                      className:
                                        'flex-1 px-3 py-2 rounded-lg border border-slate-200 text-rose-600 text-xs font-black flex items-center justify-center gap-1.5 hover:bg-rose-50',
                                      children: [e.jsx(he, { size: 14 }), ' Eliminar']
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
export { to as default };
