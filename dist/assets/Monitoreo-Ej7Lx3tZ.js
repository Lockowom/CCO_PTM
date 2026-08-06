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
import { r as j, R as Ts } from './react-vendor-6aw4XXjH.js';
import {
  X as Ie,
  R as Ne,
  ay as ca,
  c as ze,
  t as S,
  Q as me,
  at as Te,
  b1 as rs,
  a$ as da,
  x as ue,
  a7 as ce,
  b4 as ns,
  g as $e,
  ar as Se,
  ah as Je,
  aK as $s,
  b5 as Ls,
  q as Re,
  b6 as Ps,
  aD as He,
  n as xa,
  aI as ys,
  Y as pe,
  aA as es,
  b7 as ma,
  b8 as Cs,
  a as We,
  b9 as ss,
  aC as ua,
  ac as pa,
  ba as Fs,
  bb as Ms,
  h as ba,
  av as Us,
  P as Ee,
  f as ha,
  bc as ga,
  p as ks,
  aQ as Bs,
  _ as Gs,
  bd as Hs,
  an as fa,
  a1 as Na,
  a3 as ja
} from './ui-vendor-CTbhg6u_.js';
import { _ as je, u as ve, C as va } from './index-BVkgVG0h.js';
import { e as _a } from './exportExcel-D85v870c.js';
import { a as ls, s as is } from './storageUrl-Bzvs5Ps_.js';
import {
  E as Le,
  d as wa,
  u as ya,
  s as ke,
  C as cs,
  a as ds,
  r as xs,
  i as ms,
  b as us,
  R as ps,
  c as Ca,
  e as Vs,
  g as De,
  h as Ks,
  j as qs,
  k as ka,
  l as Ea,
  m as Aa,
  n as Js,
  D as Oa,
  o as Sa,
  p as Ra,
  q as Ws,
  t as Da,
  w as Es,
  x as Ia,
  y as za,
  z as Ta,
  A as $a,
  B as La,
  G as bs,
  H as Pa,
  I as Qe,
  S as Ue,
  J as Ze,
  K as Fa,
  L as Ma,
  M as Ua,
  N as Ba,
  O as Ga,
  P as Ha,
  Q as Va,
  T as Ka,
  U as qa,
  V as Ja,
  W as Wa,
  X as hs,
  Y as Qa,
  Z as Za,
  _ as Ya,
  $ as Qs,
  a0 as Xa,
  a1 as et,
  a2 as st,
  a3 as at,
  a4 as tt,
  a5 as ot,
  a6 as Ge,
  a7 as rt,
  a8 as Be,
  a9 as Zs,
  aa as nt,
  ab as lt,
  ac as it,
  ad as ct,
  f as dt
} from './calidadService-CmehGl8F.js';
import { C as xt } from './CalidadBadge-CEy3vZj1.js';
import { f as mt } from './panelPtm-Bl5U8lI3.js';
import { u as As } from './useRealtimeTable-BUhXLVSA.js';
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
  const d = Os.codigos[s] || { codigo: 'FO-CAL-000', revision: '01' };
  return { ...Os, ...d };
}
function ut(s) {
  const d = (s || '').split(',')[1] || '',
    l = atob(d),
    c = new Uint8Array(l.length);
  for (let E = 0; E < l.length; E++) c[E] = l.charCodeAt(E);
  return c;
}
const fs = [40, 82, 40, 54];
function Ns(s) {
  const d = gs(s);
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
function js(s) {
  const d = gs(s);
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
function vs(s, d) {
  const {
      Header: l,
      Footer: c,
      Paragraph: E,
      TextRun: f,
      Table: t,
      TableRow: h,
      TableCell: u,
      WidthType: C,
      AlignmentType: p,
      PageNumber: O,
      BorderStyle: x,
      ImageRun: I
    } = s,
    N = gs(d),
    b = {
      top: { style: x.NONE },
      bottom: { style: x.NONE },
      left: { style: x.NONE },
      right: { style: x.NONE },
      insideHorizontal: { style: x.NONE },
      insideVertical: { style: x.NONE }
    },
    L = new l({
      children: [
        new t({
          width: { size: 100, type: C.PERCENTAGE },
          borders: b,
          rows: [
            new h({
              children: [
                new u({
                  width: { size: 60, type: C.PERCENTAGE },
                  borders: b,
                  children: [
                    ...(N.logo
                      ? [
                          new E({
                            children: [
                              new I({
                                data: ut(N.logo),
                                type: 'png',
                                transformation: {
                                  width: 120,
                                  height: Math.round((120 * N.logo_h) / N.logo_w)
                                }
                              })
                            ]
                          })
                        ]
                      : []),
                    new E({ children: [new f({ text: N.empresa, bold: !0, size: 22 })] }),
                    new E({ children: [new f({ text: N.subtitulo, size: 15, color: '64748B' })] })
                  ]
                }),
                new u({
                  width: { size: 40, type: C.PERCENTAGE },
                  borders: b,
                  children: [
                    new E({
                      alignment: p.RIGHT,
                      children: [
                        new f({ text: `Código: ${N.codigo}  ·  Rev. ${N.revision}`, size: 15 })
                      ]
                    }),
                    new E({
                      alignment: p.RIGHT,
                      children: [
                        new f({
                          text: `${N.norma}  ·  Vig. ${N.fecha_revision}`,
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
            new f({
              text: `${N.codigo} · Rev. ${N.revision} · ${N.norma} · Documento controlado · Página `,
              size: 14,
              color: '94A3B8'
            }),
            new f({ children: [O.CURRENT], size: 14, color: '94A3B8' }),
            new f({ text: ' de ', size: 14, color: '94A3B8' }),
            new f({ children: [O.TOTAL_PAGES], size: 14, color: '94A3B8' })
          ]
        })
      ]
    });
  return { header: L, footer: P };
}
const Ys = (s) =>
  s != null && s.storage_path
    ? ls('monitoreo-evidencias', s.storage_path)
    : Promise.resolve((s == null ? void 0 : s.imagen_url) || '');
async function pt(s) {
  const d = await fetch(s);
  if (!d.ok) throw new Error('No se pudo cargar una imagen de evidencia');
  return await d.arrayBuffer();
}
async function bt(s) {
  const d = await fetch(s);
  if (!d.ok) throw new Error('No se pudo cargar una imagen de evidencia');
  const l = await d.blob();
  return await new Promise((c, E) => {
    const f = new FileReader();
    ((f.onload = () => c(f.result)), (f.onerror = E), f.readAsDataURL(l));
  });
}
function ht(s, d) {
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
    (l || []).forEach((f) => {
      const t = f.item_id || 'general';
      (E[t] = E[t] || []).push(f);
    }),
    { rep: c, evByItem: E }
  );
}
async function gt(s, d = [], l = []) {
  const c = await je(() => import('./index-BmpJy8SR.js'), []),
    {
      Document: E,
      Packer: f,
      Paragraph: t,
      TextRun: h,
      HeadingLevel: u,
      Table: C,
      TableRow: p,
      TableCell: O,
      WidthType: x,
      ImageRun: I,
      AlignmentType: N
    } = c,
    { header: b, footer: L } = vs(c, 'danos'),
    { rep: P, evByItem: M } = Xs(s, d, l),
    R = (v, g) =>
      new p({
        children: [
          new O({
            width: { size: 35, type: x.PERCENTAGE },
            children: [new t({ children: [new h({ text: v, bold: !0 })] })]
          }),
          new O({ width: { size: 65, type: x.PERCENTAGE }, children: [new t(String(g ?? '—'))] })
        ]
      }),
    _ = [];
  (_.push(
    new t({ text: 'INFORME DE DAÑOS / NO CONFORMIDAD', heading: u.TITLE, alignment: N.CENTER })
  ),
    P.tipo_producto && _.push(new t({ text: P.tipo_producto, alignment: N.CENTER })),
    _.push(new t({ text: s.numero || '', alignment: N.CENTER })),
    _.push(new t('')),
    _.push(
      new C({
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
  const o = (v, g) => {
    (_.push(new t({ text: v, heading: u.HEADING_2 })), g && _.push(new t(String(g))));
  };
  (P.antecedentes && o('1. ANTECEDENTES', P.antecedentes),
    P.descripcion_hallazgo && o('2. DESCRIPCIÓN DEL HALLAZGO', P.descripcion_hallazgo),
    _.push(new t({ text: '3. DAÑOS IDENTIFICADOS', heading: u.HEADING_2 })));
  let a = 0;
  for (const v of d) {
    a += 1;
    const g =
      [v.componente_afectado, v.tipo_dano].filter(Boolean).join(' — ') ||
      v.producto ||
      `Hallazgo ${a}`;
    _.push(new t({ text: `3.${a} ${g}`, heading: u.HEADING_3 }));
    const D = [];
    ((v.producto || v.codigo_producto) &&
      D.push(
        `Producto: ${v.producto || ''} ${v.codigo_producto ? `(${v.codigo_producto})` : ''}`.trim()
      ),
      Number(v.cantidad) > 0 && D.push(`Cantidad: ${Number(v.cantidad)}`),
      v.ubicacion && D.push(`Ubicación: ${v.ubicacion}`),
      v.partida && D.push(`Lote: ${v.partida}`),
      v.tipo_dano && D.push(`Tipo de daño: ${v.tipo_dano}`),
      v.componente_afectado && D.push(`Componente afectado: ${v.componente_afectado}`),
      v.consecuencia && D.push(`Consecuencia: ${v.consecuencia}`),
      v.observaciones && D.push(`Observaciones: ${v.observaciones}`),
      D.forEach((J) => _.push(new t({ children: [new h(J)] }))));
    const Q = M[v.id] || [];
    for (const J of Q)
      try {
        const F = await pt(await Ys(J));
        (_.push(
          new t({
            children: [new I({ data: F, type: 'jpg', transformation: { width: 320, height: 240 } })]
          })
        ),
          J.descripcion &&
            _.push(new t({ children: [new h({ text: J.descripcion, italics: !0, size: 18 })] })));
      } catch {}
    _.push(new t(''));
  }
  (Array.isArray(P.cuadro_resumen) &&
    P.cuadro_resumen.length &&
    (_.push(new t({ text: '4. CUADRO RESUMEN DE HALLAZGOS', heading: u.HEADING_2 })),
    _.push(
      new C({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          new p({
            children: [
              new O({ children: [new t({ children: [new h({ text: 'Indicador', bold: !0 })] })] }),
              new O({ children: [new t({ children: [new h({ text: 'Valor', bold: !0 })] })] })
            ]
          }),
          ...P.cuadro_resumen.map(
            (v) =>
              new p({
                children: [
                  new O({ children: [new t(String(v.indicador ?? ''))] }),
                  new O({ children: [new t(String(v.valor ?? ''))] })
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
        .forEach((v) => _.push(new t({ text: v, bullet: { level: 0 } }))),
      _.push(new t(''))),
    _.push(new t('')),
    _.push(
      new C({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          new p({
            children: [
              new O({
                children: [
                  new t('_______________________________'),
                  new t({
                    children: [
                      new h({
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
                    children: [new h({ text: P.revisado_por || 'Nombre / Firma', bold: !0 })]
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
      sections: [{ headers: { default: b }, footers: { default: L }, children: _ }]
    }),
    n = await f.toBlob(m);
  ht(n, `${s.numero || 'Informe_Danos'}.docx`);
}
async function ft(s, d = [], l = []) {
  var N;
  const c = await je(
      () => import('./pdfmake-pNuCVKVo.js').then((b) => b.p),
      __vite__mapDeps([0, 1])
    ),
    E = await je(() => import('./vfs_fonts-CfcbzCvn.js').then((b) => b.v), __vite__mapDeps([2, 1])),
    f = c.default || c,
    t = E.default || E;
  f.vfs = ((N = t.pdfMake) == null ? void 0 : N.vfs) || t.vfs || f.vfs;
  const { rep: h, evByItem: u } = Xs(s, d, l),
    C = [];
  (C.push({ text: 'INFORME DE DAÑOS / NO CONFORMIDAD', style: 'title' }),
    h.tipo_producto && C.push({ text: h.tipo_producto, alignment: 'center', margin: [0, 0, 0, 2] }),
    C.push({ text: s.numero || '', alignment: 'center', margin: [0, 0, 0, 10], color: '#64748b' }));
  const p = (b, L) => [{ text: b, bold: !0 }, { text: String(L ?? '—') }];
  C.push({
    table: {
      widths: ['35%', '65%'],
      body: [
        p('Fecha de recepción', h.fecha_recepcion || s.fecha),
        p('Tipo de producto', h.tipo_producto),
        p('Área responsable', h.area_responsable),
        p('Clasificación', h.clasificacion),
        p('Bodega', s.bodega),
        p('Analista', s.analista_nombre)
      ]
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 12]
  });
  const O = (b, L) => {
    (C.push({ text: b, style: 'h2' }), L && C.push({ text: String(L), margin: [0, 0, 0, 8] }));
  };
  (h.antecedentes && O('1. ANTECEDENTES', h.antecedentes),
    h.descripcion_hallazgo && O('2. DESCRIPCIÓN DEL HALLAZGO', h.descripcion_hallazgo),
    C.push({ text: '3. DAÑOS IDENTIFICADOS', style: 'h2' }));
  let x = 0;
  for (const b of d) {
    x += 1;
    const L =
      [b.componente_afectado, b.tipo_dano].filter(Boolean).join(' — ') ||
      b.producto ||
      `Hallazgo ${x}`;
    C.push({ text: `3.${x} ${L}`, style: 'h3' });
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
      P.length && C.push({ ul: P, margin: [0, 0, 0, 6] }));
    const M = u[b.id] || [],
      R = [];
    for (const _ of M)
      try {
        const o = await bt(await Ys(_));
        R.push({ image: o, width: 220, margin: [0, 4, 8, 4] });
      } catch {}
    R.length && C.push({ columns: R, columnGap: 8, margin: [0, 0, 0, 8] });
  }
  (Array.isArray(h.cuadro_resumen) &&
    h.cuadro_resumen.length &&
    (C.push({ text: '4. CUADRO RESUMEN DE HALLAZGOS', style: 'h2' }),
    C.push({
      table: {
        widths: ['70%', '30%'],
        body: [
          [
            { text: 'Indicador', bold: !0 },
            { text: 'Valor', bold: !0 }
          ],
          ...h.cuadro_resumen.map((b) => [String(b.indicador ?? ''), String(b.valor ?? '')])
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    })),
    h.analisis_causa && O('5. ANÁLISIS Y CAUSA PROBABLE', h.analisis_causa),
    Array.isArray(h.acciones_recomendadas) &&
      h.acciones_recomendadas.length &&
      (C.push({ text: '6. ACCIONES RECOMENDADAS', style: 'h2' }),
      C.push({ ul: h.acciones_recomendadas.filter(Boolean), margin: [0, 0, 0, 12] })),
    C.push({
      columns: [
        {
          stack: [
            { text: '_______________________________', margin: [0, 20, 0, 0] },
            { text: h.elaborado_por || s.analista_nombre || 'Nombre / Firma', bold: !0 },
            { text: 'Elaborado por — Control de Operaciones', fontSize: 9, color: '#64748b' }
          ]
        },
        {
          stack: [
            { text: '_______________________________', margin: [0, 20, 0, 0] },
            { text: h.revisado_por || 'Nombre / Firma', bold: !0 },
            { text: 'Revisado por — Jefatura / Supervisión', fontSize: 9, color: '#64748b' }
          ]
        }
      ],
      columnGap: 24
    }));
  const I = {
    pageMargins: fs,
    header: Ns('danos'),
    footer: js('danos'),
    content: C,
    defaultStyle: { fontSize: 10 },
    styles: {
      title: { fontSize: 16, bold: !0, alignment: 'center', margin: [0, 0, 0, 2] },
      h2: { fontSize: 12, bold: !0, margin: [0, 10, 0, 4] },
      h3: { fontSize: 11, bold: !0, margin: [0, 6, 0, 2] }
    }
  };
  f.createPdf(I).download(`${s.numero || 'Informe_Danos'}.pdf`);
}
function Nt(s, d) {
  const l = URL.createObjectURL(s),
    c = document.createElement('a');
  ((c.href = l),
    (c.download = d),
    document.body.appendChild(c),
    c.click(),
    c.remove(),
    setTimeout(() => URL.revokeObjectURL(l), 4e3));
}
const Ve = {
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
async function jt(s, d = []) {
  const l = await je(() => import('./index-BmpJy8SR.js'), []),
    {
      Document: c,
      Packer: E,
      Paragraph: f,
      TextRun: t,
      HeadingLevel: h,
      Table: u,
      TableRow: C,
      TableCell: p,
      WidthType: O,
      AlignmentType: x
    } = l,
    { header: I, footer: N } = vs(l, 'monitoreo'),
    b = ea(d),
    L = (a, m) =>
      new C({
        children: [
          new p({
            width: { size: 35, type: O.PERCENTAGE },
            children: [new f({ children: [new t({ text: a, bold: !0 })] })]
          }),
          new p({ width: { size: 65, type: O.PERCENTAGE }, children: [new f(String(m ?? '—'))] })
        ]
      }),
    P = (a) => new p({ children: [new f({ children: [new t({ text: a, bold: !0, size: 18 })] })] }),
    M = (a) =>
      new p({ children: [new f({ children: [new t({ text: String(a ?? '—'), size: 18 })] })] }),
    R = [];
  (R.push(new f({ text: 'INFORME DE MONITOREO A CALIDAD', heading: h.TITLE, alignment: x.CENTER })),
    R.push(new f({ text: s.numero || '', alignment: x.CENTER })),
    R.push(new f('')),
    R.push(
      new u({
        width: { size: 100, type: O.PERCENTAGE },
        rows: [
          L('Fecha', s.fecha),
          L('Bodega', s.bodega),
          L('Analista', s.analista_nombre),
          L('Periodicidad', s.periodicidad),
          L('Estado', (s.estado || '').replace('_', ' '))
        ]
      })
    ),
    R.push(new f('')),
    R.push(new f({ text: '1. RESUMEN EJECUTIVO', heading: h.HEADING_2 })),
    R.push(
      new u({
        width: { size: 100, type: O.PERCENTAGE },
        rows: [
          L('Total de ítems', b.total),
          L('Dictaminados', b.dictaminados),
          L('Pendientes', b.pendientes),
          L('Con problema (condición ≠ OK)', b.problema),
          L('No registrados en sistema', b.noReg),
          L('Semáforo vencimiento (🔴/🟠/🟢)', `${b.rojo} / ${b.naranja} / ${b.verde}`),
          ...b.porDictamen.map((a) => L(`Dictamen · ${Ve[a.d] || a.d}`, a.n))
        ]
      })
    ),
    R.push(new f('')),
    R.push(new f({ text: '2. DETALLE DE ÍTEMS', heading: h.HEADING_2 })),
    R.push(
      new u({
        width: { size: 100, type: O.PERCENTAGE },
        rows: [
          new C({
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
              new C({
                children: [
                  M(a.codigo_producto),
                  M(a.producto),
                  M(a.partida),
                  M(a.ubicacion),
                  M(a.cantidad),
                  M(a.cantidad_afectada || 0),
                  M((a.no_registrado ? 'NO REG · ' : '') + (a.condicion_observada || '')),
                  M(a.dictamen ? Ve[a.dictamen] || a.dictamen : 'Pendiente')
                ]
              })
          )
        ]
      })
    ),
    R.push(new f('')),
    R.push(new f('')),
    R.push(
      new u({
        width: { size: 100, type: O.PERCENTAGE },
        rows: [
          new C({
            children: [
              new p({
                children: [
                  new f('_______________________________'),
                  new f({
                    children: [new t({ text: s.analista_nombre || 'Nombre / Firma', bold: !0 })]
                  }),
                  new f('Analista — Monitoreo')
                ]
              }),
              new p({
                children: [
                  new f('_______________________________'),
                  new f({ children: [new t({ text: 'Nombre / Firma', bold: !0 })] }),
                  new f('Calidad — Dictamen')
                ]
              })
            ]
          })
        ]
      })
    ));
  const _ = new c({
      sections: [{ headers: { default: I }, footers: { default: N }, children: R }]
    }),
    o = await E.toBlob(_);
  Nt(o, `${s.numero || 'Informe_Monitoreo'}.docx`);
}
async function vt(s, d = []) {
  var C;
  const l = await je(
      () => import('./pdfmake-pNuCVKVo.js').then((p) => p.p),
      __vite__mapDeps([0, 1])
    ),
    c = await je(() => import('./vfs_fonts-CfcbzCvn.js').then((p) => p.v), __vite__mapDeps([2, 1])),
    E = l.default || l,
    f = c.default || c;
  E.vfs = ((C = f.pdfMake) == null ? void 0 : C.vfs) || f.vfs || E.vfs;
  const t = ea(d),
    h = (p, O) => [{ text: p, bold: !0 }, { text: String(O ?? '—') }],
    u = [];
  (u.push({ text: 'INFORME DE MONITOREO A CALIDAD', style: 'title' }),
    u.push({ text: s.numero || '', alignment: 'center', margin: [0, 0, 0, 10], color: '#64748b' }),
    u.push({
      table: {
        widths: ['35%', '65%'],
        body: [
          h('Fecha', s.fecha),
          h('Bodega', s.bodega),
          h('Analista', s.analista_nombre),
          h('Periodicidad', s.periodicidad),
          h('Estado', (s.estado || '').replace('_', ' '))
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
          h('Total de ítems', t.total),
          h('Dictaminados', t.dictaminados),
          h('Pendientes', t.pendientes),
          h('Con problema (condición ≠ OK)', t.problema),
          h('No registrados en sistema', t.noReg),
          h('Semáforo vencimiento (R/N/V)', `${t.rojo} / ${t.naranja} / ${t.verde}`),
          ...t.porDictamen.map((p) => h(`Dictamen · ${Ve[p.d] || p.d}`, p.n))
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
            { text: p.dictamen ? Ve[p.dictamen] || p.dictamen : 'Pendiente', fontSize: 8 }
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
      pageMargins: fs,
      header: Ns('monitoreo'),
      footer: js('monitoreo'),
      content: u,
      defaultStyle: { fontSize: 10 },
      styles: {
        title: { fontSize: 16, bold: !0, alignment: 'center', margin: [0, 0, 0, 2] },
        h2: { fontSize: 12, bold: !0, margin: [0, 10, 0, 4] }
      }
    }).download(`${s.numero || 'Informe_Monitoreo'}.pdf`));
}
async function _s(s) {
  try {
    const d = await createImageBitmap(s),
      l = 1600;
    let { width: c, height: E } = d;
    if (c > l || E > l) {
      const u = Math.min(l / c, l / E);
      ((c = Math.round(c * u)), (E = Math.round(E * u)));
    }
    const f = document.createElement('canvas');
    return (
      (f.width = c),
      (f.height = E),
      f.getContext('2d').drawImage(d, 0, 0, c, E),
      (await new Promise((u) => f.toBlob(u, 'image/jpeg', 0.82))) || s
    );
  } catch {
    return s;
  }
}
const ws = ({ onCapture: s, onClose: d }) => {
    const l = j.useRef(null),
      c = j.useRef(null),
      [E, f] = j.useState('environment'),
      [t, h] = j.useState(null),
      [u, C] = j.useState(null),
      [p, O] = j.useState(null),
      [x, I] = j.useState(!0),
      N = j.useCallback(() => {
        var o;
        try {
          (o = c.current) == null || o.getTracks().forEach((a) => a.stop());
        } catch {}
        c.current = null;
      }, []),
      b = j.useCallback(
        async (o) => {
          var a;
          (N(), I(!0), O(null));
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
            I(!1);
          }
        },
        [N]
      );
    j.useEffect(() => (b(E), N), []);
    const L = () => {
        const o = E === 'environment' ? 'user' : 'environment';
        (f(o), b(o));
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
              (C(m), h(URL.createObjectURL(m)), N());
            },
            'image/jpeg',
            0.9
          ));
      },
      M = () => {
        (t && URL.revokeObjectURL(t), h(null), C(null), b(E));
      },
      R = () => {
        if (!u) return;
        const o = new File([u], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
        (t && URL.revokeObjectURL(t), s == null || s(o), d == null || d());
      },
      _ = () => {
        (N(), t && URL.revokeObjectURL(t), d == null || d());
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
              children: e.jsx(Ie, { size: 26 })
            }),
            e.jsx('span', { className: 'text-sm font-black tracking-wide', children: 'CÁMARA' }),
            e.jsx('button', {
              onClick: L,
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
                    children: e.jsx(ze, { size: 32 })
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
  _t = ({
    informeId: s,
    itemId: d,
    evidencias: l = [],
    onChanged: c,
    canManage: E = !0,
    compact: f = !1
  }) => {
    const { user: t } = ve(),
      h = j.useRef(null),
      [u, C] = j.useState(!1),
      [p, O] = j.useState(!1),
      x = va.isNativePlatform() || (typeof navigator < 'u' && navigator.maxTouchPoints > 0),
      [I, N] = j.useState(null),
      [b, L] = j.useState({});
    j.useEffect(() => {
      let o = !0;
      return (
        is(
          Le,
          l.map((a) => a.storage_path)
        ).then((a) => {
          o && L(a);
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
              const v = await _s(n);
              await ya({ informeId: s, itemId: d, blob: v, user: t });
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
            (await wa(o), S.success('Foto eliminada'), c == null || c());
          } catch {
            S.error('No se pudo eliminar la foto');
          }
      },
      _ = f ? 'w-16 h-16' : 'w-20 h-20';
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
                      onClick: () => b[o.storage_path] && N(b[o.storage_path])
                    }),
                    E &&
                      e.jsx('button', {
                        onClick: () => R(o),
                        title: 'Eliminar foto',
                        className:
                          'absolute top-0.5 right-0.5 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity active:scale-90',
                        children: e.jsx(me, { size: 12 })
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
                onClick: () => C(!0),
                disabled: !P || p,
                title: d ? 'Tomar foto con la cámara' : 'Guarda el borrador para adjuntar fotos',
                className: `${_} shrink-0 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-500 flex flex-col items-center justify-center gap-1 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed`,
                children: [
                  p ? e.jsx(Ne, { size: 18, className: 'animate-spin' }) : e.jsx(Te, { size: 18 }),
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
                  return (o = h.current) == null ? void 0 : o.click();
                },
                disabled: !P || p,
                title: d
                  ? 'Subir foto desde archivos/galería'
                  : 'Guarda el borrador para adjuntar fotos',
                className: `${_} shrink-0 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-1 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed`,
                children: [
                  p ? e.jsx(Ne, { size: 18, className: 'animate-spin' }) : e.jsx(rs, { size: 18 }),
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
          ref: h,
          type: 'file',
          accept: 'image/*',
          multiple: !0,
          onChange: M,
          className: 'hidden'
        }),
        u &&
          e.jsx(ws, {
            onCapture: (o) => M({ target: { files: [o], value: '' } }),
            onClose: () => C(!1)
          }),
        I &&
          e.jsxs('div', {
            className: 'fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4',
            onClick: () => N(null),
            children: [
              e.jsx('button', {
                className: 'absolute top-4 right-4 text-white/80 hover:text-white p-2',
                children: e.jsx(Ie, { size: 28 })
              }),
              e.jsx('img', {
                src: I,
                alt: '',
                className: 'max-w-full max-h-full object-contain rounded-xl'
              })
            ]
          })
      ]
    });
  },
  Oe = (s) => (s.checklist && s.checklist._extras) || {},
  Ke = {
    PALLET: 'Foto del pallet',
    EMBALAJE: 'Foto del embalaje',
    CAMION: 'Foto dentro del camión',
    PRODUCTO: 'Foto del producto',
    DOCUMENTO: 'Documentación',
    GENERAL: 'Foto general'
  };
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
const sa = { OK: 'Conforme', NO: 'No conforme', NA: 'N/A' },
  yt = { IMPORTACION: 'Importación', NACIONAL: 'Nacional' };
function Pe(s, d = {}) {
  return d.tipo === 'SALIDA' || s.tipo === 'CERTIFICADO_SALIDA';
}
function aa(s, d = {}) {
  if (Pe(s, d))
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
  return Pe(s, d)
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
        ['Origen', yt[s.origen] || s.origen],
        ['Fecha de recepción', s.fecha_recepcion],
        ['Bultos', s.bultos]
      ];
}
const as = (s, d) => (Pe(s, d) ? 'salida' : 'checklist');
function qe(s = {}) {
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
  var J, F, W, A, Z, te, X;
  const c = await je(() => import('./index-BmpJy8SR.js'), []),
    {
      Document: E,
      Packer: f,
      Paragraph: t,
      TextRun: h,
      HeadingLevel: u,
      Table: C,
      TableRow: p,
      TableCell: O,
      WidthType: x,
      AlignmentType: I,
      ShadingType: N,
      BorderStyle: b
    } = c,
    { header: L, footer: P } = vs(c, as(s, l)),
    M = Pe(s, l),
    R = s.resultado === 'CONFORME',
    _ = {
      top: { style: b.NONE },
      bottom: { style: b.NONE },
      left: { style: b.NONE },
      right: { style: b.NONE },
      insideHorizontal: { style: b.NONE },
      insideVertical: { style: b.NONE }
    },
    o = (z, V) =>
      new p({
        children: [
          new O({
            width: { size: 35, type: x.PERCENTAGE },
            children: [new t({ children: [new h({ text: z, bold: !0 })] })]
          }),
          new O({ width: { size: 65, type: x.PERCENTAGE }, children: [new t(String(V ?? '—'))] })
        ]
      }),
    a = (z) => new O({ children: [new t({ children: [new h({ text: z, bold: !0, size: 18 })] })] }),
    m = (z) =>
      new O({ children: [new t({ children: [new h({ text: String(z ?? '—'), size: 18 })] })] }),
    n = [];
  (n.push(new t({ text: aa(s, l), heading: u.TITLE, alignment: I.CENTER })),
    l.soloNoSanitario &&
      n.push(
        new t({
          alignment: I.CENTER,
          children: [
            new h({
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
      new C({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          new p({
            children: [
              new O({
                shading: { fill: R ? 'ECFDF5' : 'FEF2F2', type: N.CLEAR, color: 'auto' },
                children: [
                  new t({
                    children: [
                      new h({
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
                    children: [new h({ text: `Folio: ${s.folio || '—'}`, bold: !0, size: 26 })]
                  }),
                  new t({
                    children: [
                      new h({
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
      new C({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          ...ta(s, l).map(([z, V]) => o(z, V)),
          o(
            'Resultado',
            R ? 'CONFORME' : s.resultado === 'NO_CONFORME' ? 'NO CONFORME' : s.estado || '—'
          ),
          ...(M ? [o('Estado de despacho', `${ke(s).emoji} ${ke(s).label}`)] : []),
          ...(qe(l) ? [o('Familias de producto', qe(l))] : []),
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
  const v = M && Array.isArray((J = s.contexto) == null ? void 0 : J.skus) ? s.contexto.skus : [];
  v.length &&
    (n.push(new t({ text: 'SKUs del despacho', heading: u.HEADING_2 })),
    n.push(
      new C({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          new p({ children: ['Código', 'Producto', 'Ubicación', 'Cantidad'].map(a) }),
          ...v.map(
            (z) =>
              new p({
                children: [
                  m(z.codigo_producto),
                  m(z.producto),
                  m(z.ubicacion),
                  m(`${z.cantidad ?? '—'} ${z.unidad_medida || ''}`.trim())
                ]
              })
          )
        ]
      })
    ),
    n.push(new t('')));
  const g = s.checklist || {};
  if (
    (d.forEach((z) => {
      (n.push(new t({ text: z.titulo, heading: u.HEADING_2 })),
        n.push(
          new C({
            width: { size: 100, type: x.PERCENTAGE },
            rows: [
              new p({ children: ['Requisito', 'Resultado', 'Evidencia', 'Observación'].map(a) }),
              ...z.params.map((V) => {
                var ee, Y, w;
                return new p({
                  children: [
                    m(V.label),
                    m(sa[(ee = g[V.id]) == null ? void 0 : ee.estado] || '—'),
                    m(((Y = g[V.id]) == null ? void 0 : Y.evidencia) || '—'),
                    m(((w = g[V.id]) == null ? void 0 : w.nota) || '')
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
    const z = Oe(s);
    (Array.isArray(z.clasificacion) &&
      z.clasificacion.length &&
      (n.push(new t({ text: 'Clasificación del producto', heading: u.HEADING_2 })),
      cs.forEach((Y) => {
        n.push(new t(`${z.clasificacion.includes(Y.id) ? '☑' : '☐'} ${Y.label}`));
      }),
      n.push(new t(''))),
      z.embalaje &&
        Object.values(z.embalaje).some(Boolean) &&
        (n.push(new t({ text: 'Evaluación del embalaje', heading: u.HEADING_2 })),
        n.push(
          new C({
            width: { size: 100, type: x.PERCENTAGE },
            rows: ds.map((Y) => o(Y.label, z.embalaje[Y.id] || '—'))
          })
        ),
        n.push(new t(''))));
    const V = xs(s.checklist);
    (n.push(
      new C({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          ...(z.disposicionInmediata ? [o('Disposición inmediata', z.disposicionInmediata)] : []),
          o('Riesgo de la recepción', `${V.emoji} ${V.label}`)
        ]
      })
    ),
      n.push(new t('')));
    const ee = ms(s);
    (n.push(new t({ text: 'Indicadores ISO', heading: u.HEADING_2 })),
      n.push(
        new C({
          width: { size: 100, type: x.PERCENTAGE },
          rows: [
            o('Tiempo recepción', ee.minutos != null ? `${ee.minutos} minutos` : '—'),
            o('Inspector', ee.inspector || '—'),
            o('N° ítems', ee.items),
            o('Conformes', ee.ok),
            o('No conformes', ee.no),
            o('Resultado', ee.pct != null ? `${String(ee.pct).replace('.', ',')}%` : '—')
          ]
        })
      ),
      n.push(new t('')));
  }
  if (M) {
    const z = Oe(s),
      V = us(
        (F = z.pesos) == null ? void 0 : F.esperado,
        (W = z.pesos) == null ? void 0 : W.registrado
      );
    (((A = z.pesos) != null && A.esperado) || ((Z = z.pesos) != null && Z.registrado)) &&
      (n.push(new t({ text: 'Control de peso', heading: u.HEADING_2 })),
      n.push(
        new C({
          width: { size: 100, type: x.PERCENTAGE },
          rows: [
            o(
              'Peso esperado',
              (te = z.pesos) != null && te.esperado ? `${z.pesos.esperado} kg` : '—'
            ),
            o(
              'Peso registrado',
              (X = z.pesos) != null && X.registrado ? `${z.pesos.registrado} kg` : '—'
            ),
            o('Resultado', V || '—')
          ]
        })
      ),
      n.push(new t('')));
    const ee = Number(z.bultosTotal ?? s.bultos) || 0;
    if (ee > 0) {
      const Y = Array.isArray(z.bultosEtiquetas) ? z.bultosEtiquetas : [];
      (n.push(new t({ text: 'Verificación de bultos', heading: u.HEADING_2 })),
        n.push(
          new C({
            width: { size: 100, type: x.PERCENTAGE },
            rows: [
              new p({ children: ['Bulto', 'Etiqueta'].map(a) }),
              ...Array.from(
                { length: Math.min(ee, 60) },
                (w, G) =>
                  new p({
                    children: [m(`Bulto ${G + 1}/${ee}`), m(Y[G] ? 'Etiqueta OK' : 'Pendiente')]
                  })
              )
            ]
          })
        ),
        n.push(new t('')));
    }
    (Array.isArray(z.riesgos) &&
      z.riesgos.length &&
      (n.push(new t({ text: 'Riesgos evaluados', heading: u.HEADING_2 })),
      ps.forEach((Y) => {
        n.push(new t(`${z.riesgos.includes(Y.id) ? '☑' : '☐'} ${Y.label}`));
      }),
      n.push(new t(''))),
      Array.isArray(z.evidencias) &&
        z.evidencias.length &&
        (n.push(new t({ text: 'Evidencia fotográfica', heading: u.HEADING_2 })),
        ['PALLET', 'EMBALAJE', 'CAMION'].forEach((Y) => {
          const w = z.evidencias.filter((G) => G.tipo === Y).length;
          w && n.push(new t(`📷 ${Ke[Y]}: ${w} foto(s) asociada(s) al certificado.`));
        }),
        n.push(
          new t({
            children: [
              new h({
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
    const z = Oe(s);
    Array.isArray(z.evidencias) &&
      z.evidencias.length &&
      (n.push(new t({ text: 'Evidencia fotográfica', heading: u.HEADING_2 })),
      [...new Set(z.evidencias.map((V) => V.tipo))].forEach((V) => {
        const ee = z.evidencias.filter((Y) => Y.tipo === V).length;
        ee && n.push(new t(`📷 ${Ke[V] || V}: ${ee} foto(s) asociada(s) al checklist.`));
      }),
      n.push(
        new t({
          children: [
            new h({
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
      new C({
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
                    children: [new h({ text: s.realizado_nombre || 'Nombre / Firma', bold: !0 })]
                  }),
                  new t(M ? 'Calidad — Certificación de salida' : 'Calidad — Inspección de ingreso')
                ]
              }),
              new O({
                borders: _,
                children: [
                  new t('_______________________________'),
                  new t({ children: [new h({ text: 'Nombre / Firma', bold: !0 })] }),
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
      n.push(new t({ children: [new h({ text: 'FIRMA ELECTRÓNICA', bold: !0 })] })),
      n.push(
        new t({
          children: [
            new h({
              text: `Algoritmo: ${s.firma_algoritmo || 'HMAC-SHA256'} · Firmado por: ${s.firmado_nombre || '—'} · ${s.firmado_en ? new Date(s.firmado_en).toLocaleString('es-CL') : ''}`,
              size: 16,
              color: '475569'
            })
          ]
        })
      ),
      n.push(new t({ children: [new h({ text: s.firma_digital, size: 12, color: '94A3B8' })] })),
      n.push(
        new t({
          children: [
            new h({
              text: `Verificar en: ${window.location.origin}/verificar?folio=${s.folio || ''}`,
              size: 14,
              color: '475569'
            })
          ]
        })
      )));
  const D = new E({
      sections: [{ headers: { default: L }, footers: { default: P }, children: n }]
    }),
    Q = await f.toBlob(D);
  wt(Q, oa(s, 'docx'));
}
async function na(s, d = [], l = {}) {
  var N, b, L, P, M, R, _, o;
  const c = await je(
      () => import('./pdfmake-pNuCVKVo.js').then((a) => a.p),
      __vite__mapDeps([0, 1])
    ),
    E = await je(() => import('./vfs_fonts-CfcbzCvn.js').then((a) => a.v), __vite__mapDeps([2, 1])),
    f = c.default || c,
    t = E.default || E;
  f.vfs = ((N = t.pdfMake) == null ? void 0 : N.vfs) || t.vfs || f.vfs;
  const h = s.checklist || {},
    u = Pe(s, l),
    C = s.resultado === 'CONFORME',
    p = s.completado_en ? new Date(s.completado_en).toLocaleString('es-CL') : '—',
    O = (a, m) => [{ text: a, bold: !0 }, { text: String(m ?? '—') }],
    x = [];
  (x.push({
    text: aa(s, l),
    style: 'title',
    color: C ? '#047857' : s.resultado === 'NO_CONFORME' ? '#be123c' : '#0f172a'
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
              fillColor: C ? '#ecfdf5' : '#fef2f2',
              margin: [10, 8, 10, 8],
              stack: [
                {
                  text: C
                    ? u
                      ? 'CERTIFICADO DE CONFORMIDAD DE SALIDA — CONFORME'
                      : 'CERTIFICADO DE CONFORMIDAD — CONFORME'
                    : u
                      ? 'SALIDA NO CONFORME — NO DESPACHAR'
                      : 'RECEPCIÓN NO CONFORME',
                  bold: !0,
                  fontSize: 11,
                  color: C ? '#047857' : '#be123c'
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
        hLineColor: () => (C ? '#a7f3d0' : '#fecaca'),
        vLineColor: () => (C ? '#a7f3d0' : '#fecaca'),
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
            C ? 'CONFORME' : s.resultado === 'NO_CONFORME' ? 'NO CONFORME' : s.estado || '—'
          ),
          ...(u
            ? [
                [
                  { text: 'Estado de despacho', bold: !0 },
                  { text: ke(s).label, bold: !0, color: ke(s).color }
                ]
              ]
            : []),
          ...(qe(l) ? [O('Familias de producto', qe(l))] : []),
          ...(s.disposicion ? [O('Disposición / Acción a tomar', s.disposicion)] : []),
          O('Responsable de Calidad', s.realizado_nombre),
          O('Fecha de finalización', p)
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    }));
  const I = u && Array.isArray((b = s.contexto) == null ? void 0 : b.skus) ? s.contexto.skus : [];
  if (
    (I.length &&
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
            ...I.map((a) => [
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
                var v, g, D;
                const n = (v = h[m.id]) == null ? void 0 : v.estado;
                return [
                  { text: m.label, fontSize: 9 },
                  {
                    text: sa[n] || '—',
                    fontSize: 9,
                    bold: !0,
                    color: n === 'NO' ? '#be123c' : n === 'OK' ? '#047857' : '#64748b'
                  },
                  {
                    text: ((g = h[m.id]) == null ? void 0 : g.evidencia) || '—',
                    fontSize: 9,
                    color: '#475569'
                  },
                  { text: ((D = h[m.id]) == null ? void 0 : D.nota) || '', fontSize: 9 }
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
        columns: [0, 1].map((v) => ({
          stack: cs
            .filter((g, D) => D % 2 === v)
            .map((g) => ({
              text: `${a.clasificacion.includes(g.id) ? '☑' : '☐'} ${g.label}`,
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
            body: ds.map((v) => {
              const g = a.embalaje[v.id] || '—',
                D =
                  ['Malo', 'Incorrecto', 'Sí'].includes(g) ||
                  (v.id === 'pallet' && g === 'Regular');
              return [
                { text: v.label, bold: !0 },
                { text: g, bold: !0, color: g === '—' ? '#64748b' : D ? '#be123c' : '#047857' }
              ];
            })
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 12]
        })));
    const m = xs(s.checklist);
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
    const n = ms(s);
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
  if (u) {
    const a = Oe(s),
      m = us(
        (L = a.pesos) == null ? void 0 : L.esperado,
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
      const g = Array.isArray(a.bultosEtiquetas) ? a.bultosEtiquetas : [];
      (x.push({ text: 'Verificación de bultos', style: 'h2' }),
        x.push({
          table: {
            headerRows: 1,
            widths: ['auto', '*'],
            body: [
              ['Bulto', 'Etiqueta'].map((D) => ({ text: D, bold: !0, fontSize: 9 })),
              ...Array.from({ length: Math.min(n, 60) }, (D, Q) => [
                { text: `Bulto ${Q + 1}/${n}`, fontSize: 9 },
                {
                  text: g[Q] ? 'Etiqueta OK' : 'Pendiente',
                  fontSize: 9,
                  bold: !0,
                  color: g[Q] ? '#047857' : '#b45309'
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
        columns: [0, 1].map((g) => ({
          stack: ps
            .filter((D, Q) => Q % 2 === g)
            .map((D) => ({
              text: `${a.riesgos.includes(D.id) ? '☑' : '☐'} ${D.label}`,
              fontSize: 9,
              margin: [0, 1, 0, 1]
            }))
        })),
        columnGap: 24,
        margin: [0, 0, 0, 12]
      }));
    const v = Array.isArray(l.evidenciasImg) ? l.evidenciasImg : [];
    if (v.length || (Array.isArray(a.evidencias) && a.evidencias.length))
      if ((x.push({ text: 'Evidencia fotográfica', style: 'h2' }), v.length))
        for (let g = 0; g < v.length; g += 2)
          x.push({
            columns: v.slice(g, g + 2).map((D) => ({
              width: '50%',
              stack: [
                { image: D.dataUrl, fit: [230, 160] },
                { text: Ke[D.tipo] || D.tipo, fontSize: 8, color: '#64748b', margin: [0, 2, 0, 0] }
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
            columns: m.slice(n, n + 2).map((v) => ({
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
  f.createPdf({
    pageMargins: fs,
    header: Ns(as(s, l)),
    footer: js(as(s, l)),
    content: x,
    defaultStyle: { fontSize: 10 },
    styles: {
      title: { fontSize: 16, bold: !0, alignment: 'center', margin: [0, 0, 0, 2] },
      h2: { fontSize: 12, bold: !0, margin: [0, 10, 0, 4] }
    }
  }).download(oa(s, 'pdf'));
}
const Ct = (s) => ({
    nivel: `cat_${s.codigo}`,
    titulo: `Requisitos específicos — ${s.label}${s.clase_riesgo ? ` (Clase ${s.clase_riesgo})` : ''}`,
    categoria: s.codigo,
    params: s.params || []
  }),
  ts = {
    IMPORTACION: { label: 'Importación', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    NACIONAL: { label: 'Nacional', cls: 'bg-teal-100 text-teal-700 border-teal-200' }
  },
  kt = ({ tarea: s, onBack: d, canManage: l, onGenerarDanos: c }) => {
    var ie, i, $, U;
    const { user: E } = ve(),
      f = Ks(),
      t = qs(),
      { data: h, isLoading: u } = ka(s.id),
      C = s.estado === 'CONFORME' || s.estado === 'NO_CONFORME',
      p = C || !l,
      O = (r) => {
        const { _extras: k, ...B } = r || {};
        return { resp: B, extras: k || {} };
      },
      [x, I] = j.useState(() => O(s.checklist).resp),
      [N, b] = j.useState(() => O(s.checklist).extras),
      [L, P] = j.useState(s.observaciones || ''),
      [M, R] = j.useState(s.disposicion || '');
    j.useEffect(() => {
      const { resp: r, extras: k } = O(s.checklist);
      (I(r), b(k), P(s.observaciones || ''), R(s.disposicion || ''));
    }, [s.id]);
    const _ = (r, k) => I((B) => ({ ...B, [r]: { ...B[r], estado: k } })),
      o = (r, k) => I((B) => ({ ...B, [r]: { ...B[r], nota: k } })),
      a = (r, k) => I((B) => ({ ...B, [r]: { ...B[r], evidencia: k } })),
      m = (r, k) => b((B) => ({ ...B, [r]: k })),
      n = (r = N) => ({ ...x, _extras: r }),
      v = (r) =>
        b((k) => {
          const B = new Set(k.clasificacion || []);
          return (B.has(r) ? B.delete(r) : B.add(r), { ...k, clasificacion: [...B] });
        }),
      g = (h == null ? void 0 : h.categorias) || [],
      D = !!(h != null && h.solo_no_sanitario),
      Q = (h == null ? void 0 : h.sin_clasificar) || 0,
      J = j.useMemo(() => {
        const r = g.filter((k) => (k.params || []).length > 0).map(Ct);
        return [...Ea, ...r];
      }, [g]),
      F = j.useMemo(() => J.flatMap((r) => r.params), [J]),
      {
        answeredAll: W,
        hasNo: A,
        faltan: Z
      } = j.useMemo(() => {
        var B;
        let r = 0,
          k = !1;
        for (const K of F) {
          const ne = (B = x[K.id]) == null ? void 0 : B.estado;
          (ne && r++, ne === 'NO' && (k = !0));
        }
        return { answeredAll: r === F.length, hasNo: k, faltan: F.length - r };
      }, [x, F]),
      te = async () => {
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
      X = async (r) => {
        try {
          const k = { categorias: g, soloNoSanitario: D };
          if (r === 'pdf') {
            const B = N.evidencias || [],
              K = [];
            for (const ne of B)
              try {
                const fe = await ls(Le, ne.path);
                if (!fe) continue;
                const Ce = await fetch(fe).then((Ae) => (Ae.ok ? Ae.blob() : null));
                if (!Ce || !/image\/(jpeg|png)/.test(Ce.type)) continue;
                const Fe = await new Promise((Ae, ge) => {
                  const Me = new FileReader();
                  ((Me.onload = () => Ae(Me.result)), (Me.onerror = ge), Me.readAsDataURL(Ce));
                });
                K.push({ tipo: ne.tipo, dataUrl: Fe });
              } catch {}
            ((k.evidenciasImg = K), await na(s, J, k));
          } else await ra(s, J, k);
        } catch (k) {
          S.error(`No se pudo generar el documento: ${k.message}`);
        }
      },
      z = async () => {
        try {
          (await f.mutateAsync({
            tareaId: s.id,
            checklist: n(),
            observaciones: L,
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
          S.error(`Faltan ${Z} ítem(s) por responder`);
          return;
        }
        const r = A ? 'NO_CONFORME' : 'CONFORME';
        if (r === 'NO_CONFORME' && !M) {
          S.error('Selecciona la Disposición / Acción a tomar antes de finalizar');
          return;
        }
        if (r === 'NO_CONFORME' && !N.disposicionInmediata) {
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
            const k = await f.mutateAsync({
              tareaId: s.id,
              checklist: n(),
              observaciones: L,
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
      ee = ({ pid: r, val: k, icon: B, activeCls: K }) => {
        var fe;
        const ne = ((fe = x[r]) == null ? void 0 : fe.estado) === k;
        return e.jsx('button', {
          type: 'button',
          disabled: p,
          onClick: () => _(r, k),
          className: `w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shrink-0
          ${ne ? K : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'} ${p ? 'opacity-60 cursor-default' : ''}`,
          children: B
        });
      },
      Y = De[s.estado] || {},
      w = j.useMemo(() => xs({ ...x, _extras: N }), [x, N]),
      G = j.useMemo(() => ms({ ...s, checklist: { ...x, _extras: N } }), [x, N, s]),
      q =
        G.minutos ??
        (s.created_at
          ? Math.max(0, Math.round((Date.now() - new Date(s.created_at).getTime()) / 6e4))
          : null),
      re = N.embalaje || {},
      se = Ts.useRef(null),
      [de, _e] = j.useState(!1),
      be = typeof navigator < 'u' && navigator.maxTouchPoints > 0,
      [le, we] = j.useState(null),
      [he, ye] = j.useState(!1),
      [y, T] = j.useState({}),
      H = N.evidencias || [];
    j.useEffect(() => {
      let r = !0;
      return (
        is(
          Le,
          H.map((k) => k.path)
        ).then((k) => {
          r && T(k);
        }),
        () => {
          r = !1;
        }
      );
    }, [JSON.stringify(H.map((r) => r.path))]);
    const ae = (r, k = 'galeria') => {
        var B;
        (we(r), k === 'camara' ? _e(!0) : (B = se.current) == null || B.click());
      },
      oe = async (r) => {
        var B;
        const k = Array.from(r.target.files || []);
        if (((r.target.value = ''), !(!k.length || !le))) {
          ye(!0);
          try {
            const K = [];
            for (const ne of k) {
              if (!ne.type.startsWith('image/')) continue;
              const fe = await _s(ne),
                Ce = await Da({ tareaId: s.id, tipo: le, blob: fe });
              K.push({ tipo: le, path: Ce, subido_en: new Date().toISOString() });
            }
            if (K.length) {
              const ne = { ...N, evidencias: [...H, ...K] };
              (b(ne),
                await f.mutateAsync({
                  tareaId: s.id,
                  checklist: n(ne),
                  observaciones: L,
                  disposicion: M,
                  finalizar: !1
                }),
                S.success(K.length > 1 ? 'Fotos agregadas' : 'Foto agregada'));
            }
          } catch (K) {
            S.error(
              (B = K == null ? void 0 : K.message) != null && B.includes('row-level security')
                ? 'No tienes permiso para subir fotos'
                : `Error al subir: ${K.message}`
            );
          } finally {
            (ye(!1), we(null));
          }
        }
      },
      xe = async (r) => {
        if (confirm('¿Eliminar esta foto?'))
          try {
            await Ws(r.path);
            const k = { ...N, evidencias: H.filter((B) => B.path !== r.path) };
            (b(k),
              await f.mutateAsync({
                tareaId: s.id,
                checklist: n(k),
                observaciones: L,
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
          children: [e.jsx(Se, { size: 18 }), ' Volver a la cola']
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
                          className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${((ie = ts[s.origen]) == null ? void 0 : ie.cls) || ''}`,
                          children: ((i = ts[s.origen]) == null ? void 0 : i.label) || s.origen
                        }),
                        e.jsx('span', {
                          className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${Y.cls || ''}`,
                          children: Y.label || s.estado
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
                        (($ = s.contexto) == null ? void 0 : $.pallets) != null &&
                          e.jsxs('span', { children: ['· ', s.contexto.pallets, ' pallets'] }),
                        ((U = s.contexto) == null ? void 0 : U.tipo_contenedor) &&
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
                      onClick: () => X('pdf'),
                      title: 'Descargar PDF',
                      className:
                        'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                      children: [e.jsx(Ls, { size: 15 }), ' PDF']
                    }),
                    e.jsxs('button', {
                      onClick: () => X('word'),
                      title: 'Descargar Word',
                      className:
                        'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                      children: [e.jsx(Re, { size: 15 }), ' Word']
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
                e.jsx(Ps, { size: 22, className: 'text-emerald-600 shrink-0 mt-0.5' }),
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
          : C && l
            ? e.jsxs('div', {
                className:
                  'bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3',
                children: [
                  e.jsxs('div', {
                    className: 'text-sm text-slate-600 flex items-center gap-2',
                    children: [
                      e.jsx(He, { size: 18, className: 'text-slate-400' }),
                      ' Documento sin firmar.'
                    ]
                  }),
                  e.jsxs('button', {
                    onClick: te,
                    disabled: t.isPending,
                    className:
                      'px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50',
                    children: [e.jsx(He, { size: 16 }), ' Firmar digitalmente']
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
                u && e.jsx(ce, { size: 14, className: 'animate-spin text-slate-300' })
              ]
            }),
            g.length === 0
              ? e.jsx('p', {
                  className: 'text-xs text-slate-400',
                  children: u
                    ? 'Detectando familias…'
                    : 'Sin ítems clasificables en la recepción. Se aplican solo los controles universales.'
                })
              : e.jsx('div', {
                  className: 'flex flex-wrap gap-2',
                  children: g.map((r) => {
                    var k;
                    return e.jsxs(
                      'span',
                      {
                        className: `text-[11px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${((k = Aa[r.codigo]) == null ? void 0 : k.cls) || 'bg-slate-100 text-slate-600 border-slate-200'}`,
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
            (h == null ? void 0 : h.requiere_registro_isp) &&
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
            D &&
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
            Q > 0 &&
              e.jsxs('p', {
                className:
                  'mt-3 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 flex items-start gap-1.5',
                children: [
                  e.jsx(pe, { size: 13, className: 'mt-0.5 shrink-0' }),
                  Q,
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
              children: cs.map((r) => {
                const k = (N.clasificacion || []).includes(r.id);
                return e.jsxs(
                  'button',
                  {
                    type: 'button',
                    disabled: p,
                    onClick: () => v(r.id),
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
                    e.jsx($e, { size: 16, className: 'text-slate-400' }),
                    ' Evaluación del embalaje'
                  ]
                }),
                e.jsxs('span', {
                  className: `text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${w.cls}`,
                  children: [w.emoji, ' ', w.label]
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
                    onClick: () => m('embalaje', { ...re, ...Es.conforme }),
                    className:
                      'px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-black hover:bg-emerald-100 inline-flex items-center gap-1.5',
                    children: [e.jsx(ze, { size: 13 }), ' Todo conforme']
                  }),
                  e.jsxs('button', {
                    type: 'button',
                    onClick: () => m('embalaje', { ...re, ...Es.sinPallet }),
                    className:
                      'px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs font-black hover:bg-slate-100 inline-flex items-center gap-1.5',
                    children: [e.jsx(es, { size: 13 }), ' Sin pallet / film (N/A)']
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
              children: ds.map((r) =>
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
                          const B = re[r.id] === k,
                            K =
                              ['Malo', 'Incorrecto', 'Sí'].includes(k) ||
                              (r.id === 'pallet' && k === 'Regular'),
                            ne = k === Ra;
                          return e.jsx(
                            'button',
                            {
                              type: 'button',
                              disabled: p,
                              onClick: () => m('embalaje', { ...re, [r.id]: B ? void 0 : k }),
                              className: `px-3 py-1.5 rounded-lg border text-xs font-black transition-colors ${B ? (ne ? 'bg-slate-400 border-slate-400 text-white' : K ? 'bg-rose-500 border-rose-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white') : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`,
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
                        var B, K, ne, fe, Ce, Fe, Ae;
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
                                  ((B = x[k.id]) == null ? void 0 : B.estado) &&
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
                                          onChange: (ge) => a(k.id, ge.target.value),
                                          className: `px-2 py-1 rounded-lg border text-[11px] font-bold ${(ne = x[k.id]) != null && ne.evidencia ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 text-slate-400'}`,
                                          children: [
                                            e.jsx('option', {
                                              value: '',
                                              children: '— cómo se verificó —'
                                            }),
                                            Js.map((ge) =>
                                              e.jsx('option', { value: ge, children: ge }, ge)
                                            )
                                          ]
                                        })
                                      ]
                                    }),
                                  ((fe = x[k.id]) == null ? void 0 : fe.estado) === 'NO' &&
                                    e.jsx('input', {
                                      value: ((Ce = x[k.id]) == null ? void 0 : Ce.nota) || '',
                                      disabled: p,
                                      onChange: (ge) => o(k.id, ge.target.value),
                                      placeholder: 'Detalle de la no conformidad…',
                                      className:
                                        'mt-1.5 w-full px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/40 text-xs outline-none focus:border-rose-400'
                                    }),
                                  ((Fe = x[k.id]) == null ? void 0 : Fe.estado) === 'NA' &&
                                    e.jsx('input', {
                                      value: ((Ae = x[k.id]) == null ? void 0 : Ae.nota) || '',
                                      disabled: p,
                                      onChange: (ge) => o(k.id, ge.target.value),
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
                                  e.jsx(ee, {
                                    pid: k.id,
                                    val: 'OK',
                                    icon: e.jsx(ze, { size: 16 }),
                                    activeCls: 'bg-emerald-500 border-emerald-500 text-white'
                                  }),
                                  e.jsx(ee, {
                                    pid: k.id,
                                    val: 'NO',
                                    icon: e.jsx(Ie, { size: 16 }),
                                    activeCls: 'bg-rose-500 border-rose-500 text-white'
                                  }),
                                  e.jsx(ee, {
                                    pid: k.id,
                                    val: 'NA',
                                    icon: e.jsx(es, { size: 16 }),
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
              className: `bg-white rounded-2xl border p-5 ${A && !N.disposicionInmediata ? 'border-rose-200' : 'border-slate-200'}`,
              children: [
                e.jsxs('label', {
                  className: `text-[10px] font-black uppercase tracking-widest ${A && !N.disposicionInmediata ? 'text-rose-500' : 'text-slate-400'}`,
                  children: [
                    'Disposición inmediata ',
                    A && e.jsx('span', { children: '*obligatoria (hay no conformes)' })
                  ]
                }),
                e.jsx('div', {
                  className: 'flex flex-wrap gap-2 mt-2',
                  children: Oa.map((r) => {
                    const k = N.disposicionInmediata === r,
                      B = ['Cuarentena', 'Rechazo proveedor', 'Devuelto'].includes(r);
                    return e.jsxs(
                      'button',
                      {
                        type: 'button',
                        disabled: p,
                        onClick: () => m('disposicionInmediata', k ? void 0 : r),
                        className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${k ? (B ? 'bg-rose-500 border-rose-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white') : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`,
                        children: [k ? '☑' : '☐', ' ', r]
                      },
                      r
                    );
                  })
                })
              ]
            }),
            (A || M) &&
              e.jsxs('div', {
                className: `rounded-2xl border p-5 ${A ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'}`,
                children: [
                  e.jsxs('label', {
                    className:
                      'text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-rose-500',
                    children: [
                      'Disposición / Acción a tomar ',
                      A && e.jsx('span', { children: '*obligatoria' })
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
                  value: L,
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
                  children: Sa.map((r) => {
                    const k = H.filter((B) => B.tipo === r.id);
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
                              k.map((B) =>
                                e.jsxs(
                                  'div',
                                  {
                                    className:
                                      'relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0',
                                    children: [
                                      e.jsx('a', {
                                        href: y[B.path] || '#',
                                        target: '_blank',
                                        rel: 'noreferrer',
                                        children: e.jsx('img', {
                                          src: y[B.path] || '',
                                          alt: r.label,
                                          className: 'w-full h-full object-cover'
                                        })
                                      }),
                                      !p &&
                                        e.jsx('button', {
                                          onClick: () => xe(B),
                                          title: 'Eliminar foto',
                                          className:
                                            'absolute top-0.5 right-0.5 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity',
                                          children: e.jsx(me, { size: 11 })
                                        })
                                    ]
                                  },
                                  B.path
                                )
                              ),
                              !p &&
                                be &&
                                e.jsxs('button', {
                                  type: 'button',
                                  onClick: () => ae(r.id, 'camara'),
                                  disabled: he,
                                  title: 'Tomar foto con la cámara',
                                  className:
                                    'w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-emerald-300 text-emerald-500 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40',
                                  children: [
                                    he && le === r.id
                                      ? e.jsx(Ne, { size: 16, className: 'animate-spin' })
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
                                  onClick: () => ae(r.id, 'galeria'),
                                  disabled: he,
                                  title: 'Subir foto desde archivos/galería',
                                  className:
                                    'w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40',
                                  children: [
                                    he && le === r.id
                                      ? e.jsx(Ne, { size: 16, className: 'animate-spin' })
                                      : e.jsx(rs, { size: 16 }),
                                    e.jsx('span', {
                                      className: 'text-[8px] font-black uppercase',
                                      children: be ? 'Galería' : 'Foto'
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
                  ref: se,
                  type: 'file',
                  accept: 'image/*',
                  multiple: !0,
                  onChange: oe,
                  className: 'hidden'
                }),
                de &&
                  e.jsx(ws, {
                    onCapture: (r) => oe({ target: { files: [r], value: '' } }),
                    onClose: () => _e(!1)
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
                  Z > 0
                    ? e.jsxs('span', {
                        className: 'text-slate-500',
                        children: [Z, ' ítem(s) por responder']
                      })
                    : A
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
                    onClick: z,
                    disabled: f.isPending,
                    className:
                      'px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50',
                    children: 'Guardar avance'
                  }),
                  e.jsx('button', {
                    onClick: V,
                    disabled: f.isPending || Z > 0,
                    className: `px-4 py-2.5 rounded-xl text-white font-black text-sm flex items-center gap-2 disabled:opacity-40 ${A ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`,
                    children: A
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
                  e.jsx(pe, { size: 16 }),
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
  Et = ({ onGenerarDanos: s }) => {
    const { hasPermission: d, user: l } = ve(),
      c = d('manage_quality') || d('manage_monitoreo'),
      E = (l == null ? void 0 : l.rol) === 'ADMIN' || (l == null ? void 0 : l.es_admin_delegado),
      { data: f = [], isLoading: t, refetch: h, isFetching: u } = Ca(),
      C = Vs(),
      [p, O] = j.useState(null),
      [x, I] = j.useState(''),
      [N, b] = j.useState('TODOS'),
      L = async (_, o) => {
        if (
          (o.stopPropagation(),
          !!confirm(
            `¿Eliminar la tarea de ${_.proveedor || 'recepción'} (OC ${_.oc || '—'})? Esta acción no se puede deshacer.`
          ))
        )
          try {
            (await C.mutateAsync(_.id), S.success('Tarea eliminada'));
          } catch (a) {
            S.error(`No se pudo eliminar: ${a.message}`);
          }
      },
      P = f.filter((_) => _.estado === 'PENDIENTE' || _.estado === 'EN_PROCESO').length,
      M = j.useMemo(() => {
        const _ = x.trim().toLocaleLowerCase('es-CL');
        return f.filter(
          (o) =>
            (!_ ||
              [o.oc, o.proveedor, o.folio, o.origen].some((m) =>
                String(m || '')
                  .toLocaleLowerCase('es-CL')
                  .includes(_)
              )) &&
            (N === 'TODOS' || o.estado === N)
        );
      }, [x, N, f]),
      R = p ? f.find((_) => _.id === p.id) || p : null;
    return R
      ? e.jsx(kt, { tarea: R, onBack: () => O(null), canManage: c, onGenerarDanos: s })
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
                      onClick: () => h(),
                      disabled: u,
                      className:
                        'px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                      children: [
                        e.jsx(Ne, { size: 14, className: u ? 'animate-spin' : '' }),
                        ' Actualizar'
                      ]
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2',
                  children: [
                    e.jsx(Ye, { label: 'Total', value: f.length, tone: 'slate' }),
                    e.jsx(Ye, { label: 'Por revisar', value: P, tone: 'amber' }),
                    e.jsx(Ye, { label: 'Finalizadas', value: f.length - P, tone: 'emerald' })
                  ]
                }),
                e.jsxs('div', {
                  className: 'mt-4 flex flex-col lg:flex-row gap-2',
                  children: [
                    e.jsxs('label', {
                      className: 'relative flex-1',
                      children: [
                        e.jsx(ue, {
                          size: 16,
                          className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                        }),
                        e.jsx('input', {
                          value: x,
                          onChange: (_) => I(_.target.value),
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
                              className: `whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-black tracking-wide transition ${N === _ ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-200'}`,
                              children:
                                _ === 'TODOS'
                                  ? 'Todos'
                                  : ((o = De[_]) == null ? void 0 : o.label) || _
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
                    children: ['Mostrando ', M.length, ' de ', f.length, ' recepciones.']
                  })
              ]
            }),
            t
              ? e.jsx('div', {
                  className: 'flex justify-center py-20',
                  children: e.jsx(ce, { className: 'animate-spin text-emerald-500', size: 36 })
                })
              : f.length === 0
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
                : M.length === 0
                  ? e.jsxs('div', {
                      className:
                        'rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center',
                      children: [
                        e.jsx(ue, { size: 34, className: 'mx-auto mb-3 text-slate-300' }),
                        e.jsx('h3', {
                          className: 'font-bold text-slate-500',
                          children: 'No hay coincidencias'
                        }),
                        e.jsx('button', {
                          onClick: () => {
                            (I(''), b('TODOS'));
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
                        var n, v, g;
                        const o = De[_.estado] || {},
                          a = ts[_.origen] || {},
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
                                      e.jsx($e, { size: 16, className: 'text-slate-400 shrink-0' }),
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
                                          onClick: (D) => L(_, D),
                                          title: 'Eliminar (admin)',
                                          className:
                                            'p-1.5 rounded-lg text-slate-300 hover:bg-rose-100 hover:text-rose-600',
                                          children: e.jsx(me, { size: 14 })
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
                                    ((v = _.contexto) == null ? void 0 : v.pallets) != null
                                      ? ` · ${_.contexto.pallets} pallets`
                                      : '',
                                    (g = _.contexto) != null && g.tipo_contenedor
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
  Ye = ({ label: s, value: d, tone: l }) => {
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
  At = ({ onClose: s }) => {
    const d = La(),
      [l, c] = j.useState(''),
      [E, f] = j.useState(!1),
      [t, h] = j.useState([]),
      [u, C] = j.useState([]),
      [p, O] = j.useState(''),
      [x, I] = j.useState('NORMAL'),
      N = j.useCallback(async () => {
        f(!0);
        try {
          h(await bs(l, !1));
        } catch (a) {
          S.error(`Error buscando stock: ${a.message}`);
        } finally {
          f(!1);
        }
      }, [l]),
      b = (a) => `${a.codigo_producto}|${a.partida || ''}|${a.ubicacion || ''}`,
      L = (a) => ({
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
        C((n) => [...n, L(a)]);
      },
      M = (a) => C((m) => m.filter((n) => n._key !== a)),
      R = (a) => {
        const m = b(a);
        u.some((n) => n._key === m) ? M(m) : P(a);
      },
      _ = () => {
        if (t.every((m) => u.some((n) => n._key === b(m)))) {
          const m = new Set(t.map(b));
          C((n) => n.filter((v) => !m.has(v._key)));
          return;
        }
        C((m) => {
          const n = new Set(m.map((g) => g._key)),
            v = t.map(L).filter((g) => (n.has(g._key) ? !1 : (n.add(g._key), !0)));
          return [...m, ...v];
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
                  e.jsx(ss, { size: 18, className: 'text-emerald-600' }),
                  ' Asignar SKUs a Calidad'
                ]
              }),
              e.jsx('button', {
                onClick: s,
                className: 'p-2 rounded-lg hover:bg-slate-100 text-slate-400',
                children: e.jsx(Ie, { size: 18 })
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
                      e.jsx(ue, { size: 16, className: 'text-slate-400' }),
                      e.jsx('input', {
                        value: l,
                        onChange: (a) => c(a.target.value),
                        onKeyDown: (a) => a.key === 'Enter' && N(),
                        placeholder: 'Buscar por SKU, descripción o ubicación…',
                        className: 'flex-1 text-sm outline-none bg-transparent'
                      })
                    ]
                  }),
                  e.jsxs('button', {
                    onClick: N,
                    disabled: E,
                    className:
                      'px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 disabled:opacity-50',
                    children: [
                      E
                        ? e.jsx(ce, { size: 16, className: 'animate-spin' })
                        : e.jsx(ue, { size: 16 }),
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
                                  children: e.jsx(me, { size: 15 })
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
                        onChange: (a) => I(a.target.value),
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
                    ? e.jsx(ce, { size: 16, className: 'animate-spin' })
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
  Ot = ({ canAssign: s, canManageQuality: d, onGenerarInforme: l }) => {
    const { user: c } = ve(),
      E = (c == null ? void 0 : c.rol) === 'ADMIN' || (c == null ? void 0 : c.es_admin_delegado),
      { data: f = [], isLoading: t } = Ia(),
      h = za(),
      u = Ta(),
      [C, p] = j.useState(!1),
      O = async (N) => {
        if (confirm('¿Anular esta asignación? No se podrá revertir.'))
          try {
            (await h.mutateAsync(N.id), S.success('Asignación anulada'));
          } catch (b) {
            S.error(`No se pudo anular: ${b.message}`);
          }
      },
      x = async (N) => {
        if (confirm('¿Eliminar esta asignación definitivamente? Esta acción no se puede deshacer.'))
          try {
            (await u.mutateAsync(N.id), S.success('Asignación eliminada'));
          } catch (b) {
            S.error(`No se pudo eliminar: ${b.message}`);
          }
      },
      I = f.filter((N) => N.estado === 'PENDIENTE' || N.estado === 'EN_PROCESO').length;
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
                I > 0 &&
                  e.jsxs('span', {
                    className:
                      'text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700',
                    children: [I, ' pendiente(s)']
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
              children: e.jsx(ce, { className: 'animate-spin text-emerald-500', size: 26 })
            })
          : f.length === 0
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
                children: f.map((N) => {
                  const b = $a[N.estado] || {},
                    L = Array.isArray(N.skus) ? N.skus : [],
                    P = N.estado === 'PENDIENTE' || N.estado === 'EN_PROCESO',
                    M =
                      P &&
                      N.locked_by &&
                      N.locked_at &&
                      Date.now() - new Date(N.locked_at).getTime() < 15 * 60 * 1e3,
                    R = M && N.locked_by !== (c == null ? void 0 : c.id);
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
                              children: b.label || N.estado
                            }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-1.5',
                              children: [
                                N.prioridad === 'URGENTE' &&
                                  N.estado !== 'RESUELTA' &&
                                  e.jsxs('span', {
                                    className:
                                      'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-rose-100 text-rose-700 border-rose-200 flex items-center gap-1',
                                    children: [e.jsx(pe, { size: 11 }), ' Urgente']
                                  }),
                                E &&
                                  e.jsx('button', {
                                    onClick: () => x(N),
                                    title: 'Eliminar (admin)',
                                    className:
                                      'p-1.5 rounded-lg text-slate-300 hover:bg-rose-100 hover:text-rose-600',
                                    children: e.jsx(me, { size: 14 })
                                  })
                              ]
                            })
                          ]
                        }),
                        e.jsxs('p', {
                          className: 'text-sm font-black text-slate-800',
                          children: [L.length, ' SKU(s)']
                        }),
                        e.jsxs('p', {
                          className: 'text-xs text-slate-500 line-clamp-2 mt-0.5',
                          children: [
                            L.slice(0, 3)
                              .map((_) => _.codigo_producto)
                              .join(', '),
                            L.length > 3 ? '…' : ''
                          ]
                        }),
                        N.motivo &&
                          e.jsxs('p', {
                            className: 'text-xs text-slate-400 mt-1 italic',
                            children: ['“', N.motivo, '”']
                          }),
                        e.jsxs('p', {
                          className: 'text-[11px] text-slate-400 mt-2',
                          children: [
                            N.asignado_nombre ? `Por ${N.asignado_nombre}` : 'Inventario',
                            ' ·',
                            ' ',
                            N.created_at ? new Date(N.created_at).toLocaleDateString('es-CL') : ''
                          ]
                        }),
                        M &&
                          e.jsxs('div', {
                            className: `mt-2 rounded-lg border px-2.5 py-2 text-[11px] font-bold ${R ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`,
                            children: [
                              '🔒 ',
                              R ? 'En proceso por' : 'Tarea tomada por',
                              ' ',
                              N.locked_by_name || 'otro usuario',
                              ' desde las',
                              ' ',
                              new Date(N.locked_at).toLocaleTimeString('es-CL', {
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
                                  onClick: () => l(N),
                                  title: R ? 'El sistema verificará el bloqueo antes de abrir' : '',
                                  className: `flex-1 px-3 py-2 rounded-xl text-white font-black text-xs flex items-center justify-center gap-1.5 ${R ? 'bg-slate-500 hover:bg-slate-600' : 'bg-emerald-600 hover:bg-emerald-700'}`,
                                  children: [
                                    e.jsx(Re, { size: 14 }),
                                    ' Generar informe / dictamen ',
                                    e.jsx(pa, { size: 14 })
                                  ]
                                }),
                              s &&
                                e.jsx('button', {
                                  onClick: () => O(N),
                                  title: 'Anular',
                                  className:
                                    'px-3 py-2 rounded-xl border border-slate-200 text-slate-500 font-black text-xs flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200',
                                  children: e.jsx(Fs, { size: 14 })
                                })
                            ]
                          }),
                        N.estado === 'RESUELTA' &&
                          e.jsxs('p', {
                            className:
                              'text-[11px] text-emerald-600 font-bold mt-3 flex items-center gap-1',
                            children: [
                              e.jsx(Re, { size: 12 }),
                              ' Resuelta',
                              N.resuelto_nombre ? ` por ${N.resuelto_nombre}` : ''
                            ]
                          })
                      ]
                    },
                    N.id
                  );
                })
              }),
        C && e.jsx(At, { onClose: () => p(!1) })
      ]
    });
  },
  St = ({ onClose: s, onCreated: d }) => {
    const l = Ua(),
      [c, E] = j.useState(''),
      [f, t] = j.useState(''),
      [h, u] = j.useState(''),
      [C, p] = j.useState(''),
      [O, x] = j.useState(''),
      [I, N] = j.useState(''),
      [b, L] = j.useState(!1),
      [P, M] = j.useState([]),
      [R, _] = j.useState([]),
      [o, a] = j.useState(null),
      [m, n] = j.useState(!1),
      v = j.useCallback(async () => {
        if (!c.trim()) {
          S.error('Escribe primero el número de N.V.');
          return;
        }
        n(!0);
        try {
          const A = await mt(c);
          if (!A) {
            (a(null), S.info(`La N.V ${c.trim()} no está en el Panel PTM (puedes seguir a mano).`));
            return;
          }
          (a(A),
            A.cliente && t(A.cliente),
            A.guia && u(A.guia),
            A.transportista && p(A.transportista),
            A.bultos && x(A.bultos),
            S.success(`N.V ${A.nv} encontrada en el Panel: datos cargados`));
        } catch (A) {
          S.error(`No se pudo consultar el Panel PTM: ${A.message}`);
        } finally {
          n(!1);
        }
      }, [c]),
      g = (A) => {
        const Z = new Map();
        return (
          (A || []).forEach((te) => {
            const X = `${te.codigo_producto}|${te.partida || ''}`,
              z = Z.get(X);
            z
              ? (z.disponible = Number(z.disponible || 0) + (Number(te.disponible) || 0))
              : Z.set(X, { ...te, ubicacion: '', disponible: Number(te.disponible) || 0 });
          }),
          [...Z.values()]
        );
      },
      D = j.useCallback(async () => {
        L(!0);
        try {
          M(g(await bs(I, !1)));
        } catch (A) {
          S.error(`Error buscando stock: ${A.message}`);
        } finally {
          L(!1);
        }
      }, [I]),
      Q = (A) => `${A.codigo_producto}|${A.partida || ''}`,
      J = (A) => {
        const Z = Q(A);
        if (R.some((te) => te._key === Z)) {
          S.info('Ese SKU ya está agregado');
          return;
        }
        _((te) => [
          ...te,
          {
            _key: Z,
            codigo_producto: A.codigo_producto,
            producto: A.producto || '',
            ubicacion: '',
            partida: A.partida || '',
            cantidad: Number(A.disponible) || 0,
            unidad_medida: A.unidad_medida || 'UN'
          }
        ]);
      },
      F = (A) => _((Z) => Z.filter((te) => te._key !== A)),
      W = async () => {
        if (!c.trim()) {
          S.error('Escribe la N.V.');
          return;
        }
        if (R.length === 0) {
          S.error('Agrega al menos un SKU');
          return;
        }
        try {
          const A = R.map(({ _key: te, ...X }) => X),
            Z = await l.mutateAsync({
              nv: c.trim(),
              skus: A,
              cliente: f.trim() || null,
              guia: h.trim() || null,
              transportista: C.trim() || null,
              bultos: O ? Number(O) : null
            });
          (S.success('Certificación de salida creada'), d(Z == null ? void 0 : Z.id));
        } catch (A) {
          S.error(`No se pudo crear: ${A.message}`);
        }
      };
    return e.jsx('div', {
      className: 'fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-3',
      onClick: s,
      children: e.jsxs('div', {
        className:
          'bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col',
        onClick: (A) => A.stopPropagation(),
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between p-5 border-b border-slate-100',
            children: [
              e.jsxs('h3', {
                className: 'font-black text-slate-900 flex items-center gap-2',
                children: [
                  e.jsx(Ms, { size: 18, className: 'text-emerald-600' }),
                  ' Certificar salida (manual)'
                ]
              }),
              e.jsx('button', {
                onClick: s,
                className: 'p-2 rounded-lg hover:bg-slate-100 text-slate-400',
                children: e.jsx(Ie, { size: 18 })
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
                            onChange: (A) => E(A.target.value),
                            onKeyDown: (A) => A.key === 'Enter' && v(),
                            placeholder: 'Ej. 95811',
                            className:
                              'w-full px-3 py-2 rounded-xl border border-emerald-300 text-sm font-bold outline-none focus:border-emerald-500'
                          }),
                          e.jsx('button', {
                            onClick: v,
                            disabled: m || !c.trim(),
                            title: 'Traer datos de la N.V desde el Panel PTM',
                            className:
                              'px-3 py-2 rounded-xl bg-indigo-600 text-white shrink-0 hover:bg-indigo-700 disabled:opacity-40',
                            children: m
                              ? e.jsx(ce, { size: 15, className: 'animate-spin' })
                              : e.jsx(ue, { size: 15 })
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
                        value: h,
                        onChange: (A) => u(A.target.value),
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
                        value: O,
                        onChange: (A) => x(A.target.value.replace(/[^0-9]/g, '')),
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
                        value: f,
                        onChange: (A) => t(A.target.value),
                        placeholder: 'Opcional',
                        title: f,
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
                        value: C,
                        onChange: (A) => p(A.target.value),
                        placeholder: 'Opcional',
                        className:
                          'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400'
                      })
                    ]
                  })
                ]
              }),
              o &&
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
                          children: ['N.V ', o.nv, ' · Panel Dashboard PTM']
                        }),
                        e.jsxs('span', {
                          className: 'flex items-center gap-1.5',
                          children: [
                            o.urgente &&
                              e.jsx('span', {
                                className:
                                  'px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black',
                                children: 'URGENTE'
                              }),
                            o.estado &&
                              e.jsx('span', {
                                className:
                                  'px-1.5 py-0.5 rounded-md bg-white text-indigo-700 border border-indigo-200 text-[10px] font-black',
                                children: o.estado
                              })
                          ]
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      className: 'grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-slate-600',
                      children: [
                        o.vendedor &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'Vendedor:' }),
                              ' ',
                              o.vendedor
                            ]
                          }),
                        o.factura &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'Factura:' }),
                              ' ',
                              o.factura
                            ]
                          }),
                        o.numeroEnvio &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'N° envío:' }),
                              ' ',
                              o.numeroEnvio
                            ]
                          }),
                        o.tipoDespacho &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', {
                                className: 'text-slate-400',
                                children: 'Tipo despacho:'
                              }),
                              ' ',
                              o.tipoDespacho
                            ]
                          }),
                        o.fechaCompromiso &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'Compromiso:' }),
                              ' ',
                              o.fechaCompromiso.split('-').reverse().join('-')
                            ]
                          }),
                        o.fechaDespacho &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'Despacho:' }),
                              ' ',
                              o.fechaDespacho.split('-').reverse().join('-')
                            ]
                          }),
                        o.division &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'División:' }),
                              ' ',
                              o.division
                            ]
                          }),
                        o.centroCosto &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', {
                                className: 'text-slate-400',
                                children: 'Centro costo:'
                              }),
                              ' ',
                              o.centroCosto
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
                      e.jsx(ue, { size: 16, className: 'text-slate-400' }),
                      e.jsx('input', {
                        value: I,
                        onChange: (A) => N(A.target.value),
                        onKeyDown: (A) => A.key === 'Enter' && D(),
                        placeholder: 'Buscar SKU por código, descripción o ubicación…',
                        className: 'flex-1 text-sm outline-none bg-transparent'
                      })
                    ]
                  }),
                  e.jsxs('button', {
                    onClick: D,
                    disabled: b,
                    className:
                      'px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 disabled:opacity-50',
                    children: [
                      b
                        ? e.jsx(ce, { size: 16, className: 'animate-spin' })
                        : e.jsx(ue, { size: 16 }),
                      ' ',
                      'Buscar'
                    ]
                  })
                ]
              }),
              P.length > 0 &&
                e.jsx('div', {
                  className:
                    'border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-44 overflow-y-auto',
                  children: P.map((A, Z) =>
                    e.jsxs(
                      'button',
                      {
                        onClick: () => J(A),
                        className:
                          'w-full text-left px-3 py-2 hover:bg-emerald-50/50 flex items-center justify-between gap-2',
                        children: [
                          e.jsxs('span', {
                            className: 'min-w-0',
                            children: [
                              e.jsxs('span', {
                                className: 'font-bold text-sm text-slate-800 truncate block',
                                children: [A.codigo_producto, ' · ', A.producto]
                              }),
                              e.jsxs('span', {
                                className: 'text-xs text-slate-400',
                                children: [
                                  A.partida || 's/partida',
                                  ' · ',
                                  A.disponible,
                                  ' ',
                                  A.unidad_medida,
                                  ' disponibles'
                                ]
                              })
                            ]
                          }),
                          e.jsx(Ee, { size: 16, className: 'text-emerald-500 shrink-0' })
                        ]
                      },
                      Z
                    )
                  )
                }),
              e.jsxs('div', {
                children: [
                  e.jsxs('p', {
                    className:
                      'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5',
                    children: ['SKUs del despacho (', R.length, ')']
                  }),
                  R.length === 0
                    ? e.jsx('p', {
                        className: 'text-xs text-slate-400',
                        children: 'Agrega los SKUs que se están despachando en esta N.V.'
                      })
                    : e.jsx('div', {
                        className: 'space-y-1.5',
                        children: R.map((A) =>
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
                                      children: [A.codigo_producto, ' · ', A.producto]
                                    }),
                                    e.jsxs('span', {
                                      className: 'text-xs text-slate-400',
                                      children: [
                                        A.partida || 's/partida',
                                        ' · ',
                                        A.cantidad,
                                        ' ',
                                        A.unidad_medida
                                      ]
                                    })
                                  ]
                                }),
                                e.jsx('button', {
                                  onClick: () => F(A._key),
                                  className:
                                    'p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 shrink-0',
                                  children: e.jsx(me, { size: 15 })
                                })
                              ]
                            },
                            A._key
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
                onClick: W,
                disabled: l.isPending || !c.trim() || R.length === 0,
                className:
                  'px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-40',
                children: [
                  l.isPending
                    ? e.jsx(ce, { size: 16, className: 'animate-spin' })
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
  Rt = ({ tarea: s, onBack: d, canManage: l }) => {
    const c = Ks(),
      E = qs(),
      f = s.estado === 'CONFORME' || s.estado === 'NO_CONFORME',
      t = f || !l,
      h = s.contexto || {},
      u = (y) => {
        const { _extras: T, ...H } = y || {};
        return { resp: H, extras: T || {} };
      },
      [C, p] = j.useState(() => u(s.checklist).resp),
      [O, x] = j.useState(() => u(s.checklist).extras),
      [I, N] = j.useState(s.observaciones || ''),
      [b, L] = j.useState(s.disposicion || '');
    j.useEffect(() => {
      const { resp: y, extras: T } = u(s.checklist);
      (p(y), x(T), N(s.observaciones || ''), L(s.disposicion || ''));
    }, [s.id]);
    const P = (y, T) => p((H) => ({ ...H, [y]: { ...H[y], estado: T } })),
      M = (y, T) => p((H) => ({ ...H, [y]: { ...H[y], nota: T } })),
      R = (y, T) => p((H) => ({ ...H, [y]: { ...H[y], evidencia: T } })),
      _ = (y, T) => x((H) => ({ ...H, [y]: T })),
      {
        answeredAll: o,
        hasNo: a,
        faltan: m
      } = j.useMemo(() => {
        var H;
        let y = 0,
          T = !1;
        for (const ae of Qe) {
          const oe = (H = C[ae.id]) == null ? void 0 : H.estado;
          (oe && y++, oe === 'NO' && (T = !0));
        }
        return { answeredAll: y === Qe.length, hasNo: T, faltan: Qe.length - y };
      }, [C]),
      n = async (y) => {
        try {
          const T = { tipo: 'SALIDA' };
          if (y === 'pdf') {
            const H = u(s.checklist).extras.evidencias || O.evidencias || [],
              ae = [];
            for (const oe of H)
              try {
                const xe = await ls(Le, oe.path);
                if (!xe) continue;
                const ie = await fetch(xe).then(($) => ($.ok ? $.blob() : null));
                if (!ie || !/image\/(jpeg|png)/.test(ie.type)) continue;
                const i = await new Promise(($, U) => {
                  const r = new FileReader();
                  ((r.onload = () => $(r.result)), (r.onerror = U), r.readAsDataURL(ie));
                });
                ae.push({ tipo: oe.tipo, dataUrl: i });
              } catch {}
            ((T.evidenciasImg = ae), await na(s, Ze, T));
          } else await ra(s, Ze, T);
        } catch (T) {
          S.error(`No se pudo generar el documento: ${T.message}`);
        }
      },
      v = async () => {
        if (
          confirm(
            '¿Firmar digitalmente este certificado de salida? Quedará sellado y verificable por folio/QR.'
          )
        )
          try {
            const y = await E.mutateAsync(s.id);
            S.success(`Documento firmado por ${(y == null ? void 0 : y.firmado_nombre) || ''}`);
          } catch (y) {
            S.error(`No se pudo firmar: ${y.message}`);
          }
      },
      g = (y = O) => ({ ...C, _extras: y }),
      D = async () => {
        try {
          (await c.mutateAsync({
            tareaId: s.id,
            checklist: g(),
            observaciones: I,
            disposicion: b,
            finalizar: !1
          }),
            S.success('Avance guardado'));
        } catch (y) {
          S.error(`No se pudo guardar: ${y.message}`);
        }
      },
      Q = async () => {
        if (!o) {
          S.error(`Faltan ${m} ítem(s) por responder`);
          return;
        }
        const y = a ? 'NO_CONFORME' : 'CONFORME';
        if (y === 'NO_CONFORME' && !b) {
          S.error('Selecciona la disposición antes de finalizar');
          return;
        }
        if (
          confirm(
            y === 'CONFORME'
              ? 'Todos los ítems conformes → se emitirá el CERTIFICADO DE CONFORMIDAD DE SALIDA (folio CERT-SAL-) y la tarea quedará bloqueada. ¿Continuar?'
              : `Hay ítems NO conformes → SALIDA NO CONFORME (folio ACTA-SAL-), disposición "${b}". No despachar hasta resolver. ¿Continuar?`
          )
        )
          try {
            const T = await c.mutateAsync({
              tareaId: s.id,
              checklist: g(),
              observaciones: I,
              disposicion: b,
              finalizar: !0,
              resultado: y
            });
            y === 'CONFORME'
              ? (S.success(`Salida certificada ${(T == null ? void 0 : T.folio) || ''}`), d())
              : S.warning('Salida NO CONFORME. No despachar hasta resolver.');
          } catch (T) {
            S.error(`No se pudo finalizar: ${T.message}`);
          }
      },
      J = j.useRef(null),
      [F, W] = j.useState(!1),
      A = typeof navigator < 'u' && navigator.maxTouchPoints > 0,
      [Z, te] = j.useState(null),
      [X, z] = j.useState(!1),
      [V, ee] = j.useState({}),
      Y = O.evidencias || [];
    j.useEffect(() => {
      let y = !0;
      return (
        is(
          Le,
          Y.map((T) => T.path)
        ).then((T) => {
          y && ee(T);
        }),
        () => {
          y = !1;
        }
      );
    }, [JSON.stringify(Y.map((y) => y.path))]);
    const w = (y, T = 'galeria') => {
        var H;
        (te(y), T === 'camara' ? W(!0) : (H = J.current) == null || H.click());
      },
      G = async (y) => {
        var H;
        const T = Array.from(y.target.files || []);
        if (((y.target.value = ''), !(!T.length || !Z))) {
          z(!0);
          try {
            const ae = [];
            for (const oe of T) {
              if (!oe.type.startsWith('image/')) continue;
              const xe = await _s(oe),
                ie = await Ba({ tareaId: s.id, tipo: Z, blob: xe });
              ae.push({ tipo: Z, path: ie, subido_en: new Date().toISOString() });
            }
            if (ae.length) {
              const oe = { ...O, evidencias: [...Y, ...ae] };
              (x(oe),
                await c.mutateAsync({
                  tareaId: s.id,
                  checklist: g(oe),
                  observaciones: I,
                  disposicion: b,
                  finalizar: !1
                }),
                S.success(
                  ae.length > 1 ? 'Fotos agregadas al certificado' : 'Foto agregada al certificado'
                ));
            }
          } catch (ae) {
            S.error(
              (H = ae == null ? void 0 : ae.message) != null && H.includes('row-level security')
                ? 'No tienes permiso para subir fotos'
                : `Error al subir: ${ae.message}`
            );
          } finally {
            (z(!1), te(null));
          }
        }
      },
      q = async (y) => {
        if (confirm('¿Eliminar esta foto del certificado?'))
          try {
            await Ws(y.path);
            const T = { ...O, evidencias: Y.filter((H) => H.path !== y.path) };
            (x(T),
              await c.mutateAsync({
                tareaId: s.id,
                checklist: g(T),
                observaciones: I,
                disposicion: b,
                finalizar: !1
              }),
              S.success('Foto eliminada'));
          } catch {
            S.error('No se pudo eliminar la foto');
          }
      },
      re = (y) =>
        x((T) => {
          const H = new Set(T.riesgos || []);
          return y === 'NINGUNO'
            ? { ...T, riesgos: H.has('NINGUNO') ? [] : ['NINGUNO'] }
            : (H.delete('NINGUNO'), H.has(y) ? H.delete(y) : H.add(y), { ...T, riesgos: [...H] });
        }),
      se = Number(O.bultosTotal ?? s.bultos) || 0,
      de = Array.isArray(O.bultosEtiquetas) ? O.bultosEtiquetas : [],
      _e = (y) => {
        const T = Array.from({ length: se }, (H, ae) => !!de[ae]);
        ((T[y] = !T[y]), _('bultosEtiquetas', T));
      },
      be = O.pesos || {},
      le = us(be.esperado, be.registrado),
      we = f
        ? ke(s)
        : o
          ? a
            ? b === 'Despachar con salvedades (autorizado)'
              ? { ...Ue.NARANJA }
              : { ...Ue.ROJO }
            : { ...Ue.VERDE }
          : { ...Ue.PENDIENTE },
      he = ({ pid: y, val: T, icon: H, activeCls: ae }) => {
        var xe;
        const oe = ((xe = C[y]) == null ? void 0 : xe.estado) === T;
        return e.jsx('button', {
          type: 'button',
          disabled: t,
          onClick: () => P(y, T),
          className: `w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shrink-0
          ${oe ? ae : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'} ${t ? 'opacity-60 cursor-default' : ''}`,
          children: H
        });
      },
      ye = De[s.estado] || {};
    return e.jsxs('div', {
      children: [
        e.jsxs('button', {
          onClick: d,
          className:
            'flex items-center gap-2 text-slate-500 font-bold text-sm mb-4 hover:text-slate-800',
          children: [e.jsx(Se, { size: 18 }), ' Volver a la cola']
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
                          children: s.proveedor || h.cliente || 'Sin cliente'
                        }),
                        e.jsx('span', {
                          className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${ye.cls || ''}`,
                          children: ye.label || s.estado
                        })
                      ]
                    }),
                    e.jsxs('p', {
                      className:
                        'text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-3 flex-wrap',
                      children: [
                        e.jsxs('span', { children: ['NV ', s.oc || h.nv || '—'] }),
                        e.jsxs('span', { children: ['Guía ', h.guia || '—'] }),
                        h.factura && e.jsxs('span', { children: ['Factura ', h.factura] }),
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
                      children: [e.jsx(Ls, { size: 15 }), ' PDF']
                    }),
                    e.jsxs('button', {
                      onClick: () => n('word'),
                      className:
                        'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                      children: [e.jsx(Re, { size: 15 }), ' Word']
                    })
                  ]
                })
              ]
            })
          ]
        }),
        e.jsxs('div', {
          className: `rounded-2xl border-2 p-4 mb-4 flex items-center justify-between gap-3 flex-wrap ${we.cls}`,
          children: [
            e.jsxs('div', {
              className: 'flex items-center gap-3',
              children: [
                e.jsx('span', { className: 'text-3xl leading-none', children: we.emoji }),
                e.jsxs('div', {
                  children: [
                    e.jsx('p', {
                      className: 'font-black text-lg tracking-tight',
                      children: we.label
                    }),
                    e.jsx('p', {
                      className: 'text-xs opacity-80 font-bold',
                      children: f
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
            le &&
              e.jsxs('span', {
                className: `text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${le === 'CONFORME' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`,
                children: ['Peso ', le]
              })
          ]
        }),
        Array.isArray(h.skus) &&
          h.skus.length > 0 &&
          e.jsxs('div', {
            className: 'bg-white rounded-2xl border border-slate-200 p-5 mb-4',
            children: [
              e.jsxs('h3', {
                className: 'text-sm font-black text-slate-800 mb-3 flex items-center gap-2',
                children: [
                  e.jsx($e, { size: 16, className: 'text-slate-400' }),
                  ' SKUs del despacho (',
                  h.skus.length,
                  ')'
                ]
              }),
              e.jsx('div', {
                className: 'space-y-1.5',
                children: h.skus.map((y, T) =>
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
                              children: y.codigo_producto
                            }),
                            ' ',
                            e.jsxs('span', {
                              className: 'text-slate-500',
                              children: ['· ', y.producto]
                            })
                          ]
                        }),
                        e.jsxs('span', {
                          className: 'text-xs text-slate-400 shrink-0',
                          children: [
                            y.ubicacion || '—',
                            ' · ',
                            y.cantidad,
                            ' ',
                            y.unidad_medida || ''
                          ]
                        })
                      ]
                    },
                    T
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
                e.jsx(Ps, { size: 22, className: 'text-emerald-600 shrink-0 mt-0.5' }),
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
          : f && l
            ? e.jsxs('div', {
                className:
                  'bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3',
                children: [
                  e.jsxs('div', {
                    className: 'text-sm text-slate-600 flex items-center gap-2',
                    children: [
                      e.jsx(He, { size: 18, className: 'text-slate-400' }),
                      ' Documento sin firmar.'
                    ]
                  }),
                  e.jsxs('button', {
                    onClick: v,
                    disabled: E.isPending,
                    className:
                      'px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50',
                    children: [e.jsx(He, { size: 16 }), ' Firmar digitalmente']
                  })
                ]
              })
            : null,
        e.jsxs('div', {
          className: 'space-y-4',
          children: [
            Ze.map((y) =>
              e.jsxs(
                'div',
                {
                  className: 'bg-white rounded-2xl border border-slate-200 p-5',
                  children: [
                    e.jsx('h3', {
                      className: 'text-sm font-black text-slate-800 mb-3',
                      children: y.titulo
                    }),
                    e.jsx('div', {
                      className: 'space-y-2.5',
                      children: y.params.map((T) => {
                        var H, ae, oe, xe, ie, i, $;
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
                                    children: T.label
                                  }),
                                  ((H = C[T.id]) == null ? void 0 : H.estado) &&
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
                                            ((ae = C[T.id]) == null ? void 0 : ae.evidencia) || '',
                                          disabled: t,
                                          onChange: (U) => R(T.id, U.target.value),
                                          className: `px-2 py-1 rounded-lg border text-[11px] font-bold ${(oe = C[T.id]) != null && oe.evidencia ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 text-slate-400'}`,
                                          children: [
                                            e.jsx('option', {
                                              value: '',
                                              children: '— cómo se verificó —'
                                            }),
                                            Js.map((U) =>
                                              e.jsx('option', { value: U, children: U }, U)
                                            )
                                          ]
                                        })
                                      ]
                                    }),
                                  ((xe = C[T.id]) == null ? void 0 : xe.estado) === 'NO' &&
                                    e.jsx('input', {
                                      value: ((ie = C[T.id]) == null ? void 0 : ie.nota) || '',
                                      disabled: t,
                                      onChange: (U) => M(T.id, U.target.value),
                                      placeholder: 'Detalle de la no conformidad…',
                                      className:
                                        'mt-1.5 w-full px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/40 text-xs outline-none focus:border-rose-400'
                                    }),
                                  ((i = C[T.id]) == null ? void 0 : i.estado) === 'NA' &&
                                    e.jsx('input', {
                                      value: (($ = C[T.id]) == null ? void 0 : $.nota) || '',
                                      disabled: t,
                                      onChange: (U) => M(T.id, U.target.value),
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
                                  e.jsx(he, {
                                    pid: T.id,
                                    val: 'OK',
                                    icon: e.jsx(ze, { size: 16 }),
                                    activeCls: 'bg-emerald-500 border-emerald-500 text-white'
                                  }),
                                  e.jsx(he, {
                                    pid: T.id,
                                    val: 'NO',
                                    icon: e.jsx(Ie, { size: 16 }),
                                    activeCls: 'bg-rose-500 border-rose-500 text-white'
                                  }),
                                  e.jsx(he, {
                                    pid: T.id,
                                    val: 'NA',
                                    icon: e.jsx(es, { size: 16 }),
                                    activeCls: 'bg-slate-400 border-slate-400 text-white'
                                  })
                                ]
                              })
                            ]
                          },
                          T.id
                        );
                      })
                    })
                  ]
                },
                y.nivel
              )
            ),
            e.jsxs('div', {
              className: 'bg-white rounded-2xl border border-slate-200 p-5',
              children: [
                e.jsxs('h3', {
                  className: 'text-sm font-black text-slate-800 mb-3 flex items-center gap-2',
                  children: [
                    e.jsx(ba, { size: 16, className: 'text-slate-400' }),
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
                          value: be.esperado || '',
                          disabled: t,
                          inputMode: 'decimal',
                          onChange: (y) =>
                            _('pesos', {
                              ...be,
                              esperado: y.target.value.replace(/[^0-9.,]/g, '')
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
                          value: be.registrado || '',
                          disabled: t,
                          inputMode: 'decimal',
                          onChange: (y) =>
                            _('pesos', {
                              ...be,
                              registrado: y.target.value.replace(/[^0-9.,]/g, '')
                            }),
                          placeholder: 'Ej. 125,3',
                          className:
                            'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400'
                        })
                      ]
                    }),
                    e.jsx('div', {
                      className: 'col-span-2 sm:col-span-1',
                      children: le
                        ? e.jsxs('span', {
                            className: `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-black ${le === 'CONFORME' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`,
                            children: [
                              le === 'CONFORME' ? e.jsx(ze, { size: 15 }) : e.jsx(pe, { size: 15 }),
                              ' ',
                              le
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
                        e.jsx(Us, { size: 16, className: 'text-slate-400' }),
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
                          onChange: (y) => _('bultosTotal', y.target.value.replace(/[^0-9]/g, '')),
                          className:
                            'w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-black text-center outline-none focus:border-emerald-400'
                        })
                      ]
                    })
                  ]
                }),
                se > 0
                  ? e.jsxs(e.Fragment, {
                      children: [
                        e.jsx('div', {
                          className: 'flex flex-wrap gap-2',
                          children: Array.from({ length: Math.min(se, 60) }, (y, T) =>
                            e.jsxs(
                              'button',
                              {
                                type: 'button',
                                disabled: t,
                                onClick: () => _e(T),
                                className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${de[T] ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'}`,
                                children: [
                                  'Bulto ',
                                  T + 1,
                                  '/',
                                  se,
                                  ' · ',
                                  de[T] ? 'Etiqueta OK' : 'Pendiente'
                                ]
                              },
                              T
                            )
                          )
                        }),
                        e.jsxs('p', {
                          className: 'text-xs font-bold mt-2 text-slate-500',
                          children: [
                            de.slice(0, se).filter(Boolean).length,
                            '/',
                            se,
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
                    e.jsx(pe, { size: 16, className: 'text-slate-400' }),
                    ' Riesgos evaluados'
                  ]
                }),
                e.jsx('div', {
                  className: 'flex flex-wrap gap-2',
                  children: ps.map((y) => {
                    const T = (O.riesgos || []).includes(y.id);
                    return e.jsxs(
                      'button',
                      {
                        type: 'button',
                        disabled: t,
                        onClick: () => re(y.id),
                        className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${T ? (y.id === 'NINGUNO' ? 'bg-slate-700 border-slate-700 text-white' : 'bg-amber-500 border-amber-500 text-white') : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'}`,
                        children: [T ? '☑' : '☐', ' ', y.label]
                      },
                      y.id
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
                  children: Fa.map((y) => {
                    const T = Y.filter((H) => H.tipo === y.id);
                    return e.jsxs(
                      'div',
                      {
                        className: 'rounded-xl border border-slate-100 p-3',
                        children: [
                          e.jsxs('p', {
                            className:
                              'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2',
                            children: ['📷 ', y.label, ' (', T.length, ')']
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2 flex-wrap',
                            children: [
                              T.map((H) =>
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
                                          alt: y.label,
                                          className: 'w-full h-full object-cover'
                                        })
                                      }),
                                      !t &&
                                        e.jsx('button', {
                                          onClick: () => q(H),
                                          title: 'Eliminar foto',
                                          className:
                                            'absolute top-0.5 right-0.5 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity',
                                          children: e.jsx(me, { size: 11 })
                                        })
                                    ]
                                  },
                                  H.path
                                )
                              ),
                              !t &&
                                A &&
                                e.jsxs('button', {
                                  type: 'button',
                                  onClick: () => w(y.id, 'camara'),
                                  disabled: X,
                                  title: 'Tomar foto con la cámara',
                                  className:
                                    'w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-emerald-300 text-emerald-500 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40',
                                  children: [
                                    X && Z === y.id
                                      ? e.jsx(Ne, { size: 16, className: 'animate-spin' })
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
                                  onClick: () => w(y.id, 'galeria'),
                                  disabled: X,
                                  title: 'Subir foto desde archivos/galería',
                                  className:
                                    'w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40',
                                  children: [
                                    X && Z === y.id
                                      ? e.jsx(Ne, { size: 16, className: 'animate-spin' })
                                      : e.jsx(rs, { size: 16 }),
                                    e.jsx('span', {
                                      className: 'text-[8px] font-black uppercase',
                                      children: A ? 'Galería' : 'Foto'
                                    })
                                  ]
                                }),
                              T.length === 0 &&
                                t &&
                                e.jsx('span', {
                                  className: 'text-xs text-slate-300',
                                  children: 'Sin fotos'
                                })
                            ]
                          })
                        ]
                      },
                      y.id
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
                  e.jsx(ws, {
                    onCapture: (y) => G({ target: { files: [y], value: '' } }),
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
                    onChange: (y) => L(y.target.value),
                    className:
                      'mt-1.5 w-full px-3 py-2 rounded-xl border border-rose-200 text-sm font-bold outline-none focus:border-rose-400 bg-white',
                    children: [
                      e.jsx('option', { value: '', children: '— Seleccionar disposición —' }),
                      Ma.map((y) => e.jsx('option', { value: y, children: y }, y))
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
                  value: I,
                  disabled: t,
                  onChange: (y) => N(y.target.value),
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
                    onClick: D,
                    disabled: c.isPending,
                    className:
                      'px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50',
                    children: 'Guardar avance'
                  }),
                  e.jsx('button', {
                    onClick: Q,
                    disabled: c.isPending || m > 0,
                    className: `px-4 py-2.5 rounded-xl text-white font-black text-sm flex items-center gap-2 disabled:opacity-40 ${a ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`,
                    children: a
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
              e.jsx(pe, { size: 16 }),
              ' Salida ',
              e.jsx('b', { children: 'NO CONFORME' }),
              '. No despachar hasta resolver.',
              s.disposicion ? ` Disposición: ${s.disposicion}.` : ''
            ]
          })
      ]
    });
  },
  Dt = () => {
    const { hasPermission: s, user: d } = ve(),
      l = s('manage_quality') || s('manage_monitoreo'),
      c = (d == null ? void 0 : d.rol) === 'ADMIN' || (d == null ? void 0 : d.es_admin_delegado),
      { data: E = [], isLoading: f, refetch: t, isFetching: h } = Pa(),
      u = Vs(),
      [C, p] = j.useState(null),
      [O, x] = j.useState(!1),
      [I, N] = j.useState(''),
      [b, L] = j.useState('TODOS'),
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
      R = j.useMemo(() => {
        const o = I.trim().toLocaleLowerCase('es-CL');
        return E.filter((a) => {
          const m = a.contexto || {};
          return (
            (!o ||
              [a.oc, a.proveedor, a.folio, m.cliente, m.guia, m.transportista].some((v) =>
                String(v || '')
                  .toLocaleLowerCase('es-CL')
                  .includes(o)
              )) &&
            (b === 'TODOS' || a.estado === b)
          );
        });
      }, [I, b, E]),
      _ = (C && E.find((o) => o.id === C)) || null;
    return _
      ? e.jsx(Rt, { tarea: _, onBack: () => p(null), canManage: l })
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
                          disabled: h,
                          className:
                            'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                          children: [
                            e.jsx(Ne, { size: 14, className: h ? 'animate-spin' : '' }),
                            ' Actualizar'
                          ]
                        }),
                        l &&
                          e.jsxs('button', {
                            onClick: () => x(!0),
                            className:
                              'px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-emerald-700',
                            children: [e.jsx(Ms, { size: 14 }), ' Certificar salida (N.V. + SKU)']
                          })
                      ]
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2',
                  children: [
                    e.jsx(Xe, { label: 'Total', value: E.length, tone: 'slate' }),
                    e.jsx(Xe, { label: 'Por certificar', value: M, tone: 'amber' }),
                    e.jsx(Xe, { label: 'Emitidas', value: E.length - M, tone: 'emerald' })
                  ]
                }),
                e.jsxs('div', {
                  className: 'mt-4 flex flex-col lg:flex-row gap-2',
                  children: [
                    e.jsxs('label', {
                      className: 'relative flex-1',
                      children: [
                        e.jsx(ue, {
                          size: 16,
                          className: 'absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                        }),
                        e.jsx('input', {
                          value: I,
                          onChange: (o) => N(o.target.value),
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
                              onClick: () => L(o),
                              className: `whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-black tracking-wide transition ${b === o ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-200'}`,
                              children:
                                o === 'TODOS'
                                  ? 'Todos'
                                  : ((a = De[o]) == null ? void 0 : a.label) || o
                            },
                            o
                          );
                        }
                      )
                    })
                  ]
                }),
                !f &&
                  e.jsxs('p', {
                    className: 'mt-2 text-[11px] font-bold text-slate-400',
                    children: ['Mostrando ', R.length, ' de ', E.length, ' certificaciones.']
                  })
              ]
            }),
            f
              ? e.jsx('div', {
                  className: 'flex justify-center py-20',
                  children: e.jsx(ce, { className: 'animate-spin text-emerald-500', size: 36 })
                })
              : E.length === 0
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
                : R.length === 0
                  ? e.jsxs('div', {
                      className:
                        'rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center',
                      children: [
                        e.jsx(ue, { size: 34, className: 'mx-auto mb-3 text-slate-300' }),
                        e.jsx('h3', {
                          className: 'font-bold text-slate-500',
                          children: 'No hay certificaciones que coincidan'
                        }),
                        e.jsx('button', {
                          onClick: () => {
                            (N(''), L('TODOS'));
                          },
                          className: 'mt-2 text-xs font-black text-teal-600 hover:text-teal-700',
                          children: 'Limpiar filtros'
                        })
                      ]
                    })
                  : e.jsx('div', {
                      className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
                      children: R.map((o) => {
                        const a = De[o.estado] || {},
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
                                      e.jsx($e, { size: 16, className: 'text-slate-400 shrink-0' }),
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
                                          onClick: (v) => P(o, v),
                                          title: 'Eliminar (admin)',
                                          className:
                                            'p-1.5 rounded-lg text-slate-300 hover:bg-rose-100 hover:text-rose-600',
                                          children: e.jsx(me, { size: 14 })
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
                                      const v = ke(o);
                                      return e.jsxs('span', {
                                        className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${v.cls}`,
                                        children: [v.emoji, ' ', v.label]
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
              e.jsx(St, {
                onClose: () => x(!1),
                onCreated: (o) => {
                  (x(!1), o && p(o));
                }
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
  It = () => {
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
  la = {
    BORRADOR: 'bg-slate-100 text-slate-600 border-slate-200',
    ENVIADO_CALIDAD: 'bg-blue-100 text-blue-700 border-blue-200',
    DICTAMINADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CERRADO: 'bg-slate-800 text-white border-slate-800'
  },
  Ss = {
    MONITOREO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DANOS: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  zt = ({ codigo: s, value: d, onSelect: l }) => {
    const [c, E] = j.useState(!1),
      [f, t] = j.useState(''),
      [h, u] = j.useState([]),
      [C, p] = j.useState(!1),
      O = Ts.useRef(null);
    (j.useEffect(() => {
      if (!c) return;
      let I = !0;
      p(!0);
      const N = setTimeout(async () => {
        try {
          const b = await dt(s, f);
          I && u(b);
        } catch {
          I && u([]);
        } finally {
          I && p(!1);
        }
      }, 220);
      return () => {
        ((I = !1), clearTimeout(N));
      };
    }, [c, f, s]),
      j.useEffect(() => {
        const I = (N) => {
          O.current && !O.current.contains(N.target) && E(!1);
        };
        return (
          c && document.addEventListener('mousedown', I),
          () => document.removeEventListener('mousedown', I)
        );
      }, [c]));
    const x = (I) => {
      (l(I.valor, I.ubicacion || ''), E(!1), t(''));
    };
    return e.jsxs('div', {
      className: 'relative',
      ref: O,
      children: [
        e.jsxs('button', {
          type: 'button',
          onClick: () => E((I) => !I),
          className:
            'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-left outline-none hover:border-emerald-400 flex items-center justify-between gap-2',
          children: [
            e.jsx('span', {
              className: d ? 'text-slate-800 truncate' : 'text-slate-300',
              children: d || 'Elegir lote / serie…'
            }),
            e.jsx(ue, { size: 14, className: 'text-slate-400 shrink-0' })
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
                  value: f,
                  onChange: (I) => t(I.target.value),
                  placeholder: 'Filtrar lote (P) o serie (S)…',
                  className:
                    'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-400'
                })
              }),
              e.jsx('div', {
                className: 'max-h-56 overflow-y-auto',
                children: C
                  ? e.jsxs('div', {
                      className: 'py-6 text-center text-xs text-slate-400',
                      children: [
                        e.jsx(ce, { size: 16, className: 'animate-spin inline mr-1' }),
                        ' Buscando…'
                      ]
                    })
                  : h.length === 0
                    ? e.jsxs('div', {
                        className: 'py-5 text-center text-xs text-slate-400',
                        children: ['Sin lotes/series ', f ? `para "${f}"` : '']
                      })
                    : h.map((I, N) =>
                        e.jsxs(
                          'button',
                          {
                            type: 'button',
                            onClick: () => x(I),
                            className:
                              'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-emerald-50/50 border-b border-slate-50 last:border-0',
                            children: [
                              e.jsx('span', {
                                className: `text-[9px] font-black px-1.5 py-0.5 rounded ${I.tipo === 'P' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`,
                                children: I.tipo === 'P' ? 'LOTE' : 'SERIE'
                              }),
                              e.jsx('span', {
                                className:
                                  'font-mono text-xs font-bold text-slate-800 truncate flex-1',
                                children: I.valor
                              }),
                              I.ubicacion &&
                                e.jsx('span', {
                                  className: 'text-[10px] text-slate-400 font-mono shrink-0',
                                  children: I.ubicacion
                                }),
                              e.jsx('span', {
                                className: `text-xs font-bold shrink-0 ${Number(I.disponible) > 0 ? 'text-emerald-600' : 'text-slate-300'}`,
                                children: Number(I.disponible) || 0
                              })
                            ]
                          },
                          N
                        )
                      )
              })
            ]
          })
      ]
    });
  },
  Rs = 'Lote no encontrado en el sistema al momento de la inspección',
  Tt = [
    { id: 'system', label: 'Sistema' },
    { id: 'manual', label: 'Manual' },
    { id: 'none', label: 'Sin lote/partida' },
    { id: 'not_found', label: 'No corresponde a los mostrados' }
  ],
  $t = ({ item: s, onChange: d }) => {
    const l = s.batch_source || (s.partida ? 'system' : 'none'),
      c = s.batch_value ?? s.partida ?? '',
      E = (t) => {
        var u;
        const h = {
          batch_source: t,
          batch_value: ['none', 'not_found'].includes(t) ? null : '',
          partida: ''
        };
        (t === 'not_found' &&
          !String(s.observaciones || '').includes(Rs) &&
          (h.observaciones = [(u = s.observaciones) == null ? void 0 : u.trim(), Rs]
            .filter(Boolean)
            .join(' · ')),
          d(h));
      },
      f = (t, h = '') =>
        d({ batch_value: t || null, partida: t || '', ...(h ? { ubicacion: h } : {}) });
    return e.jsxs('div', {
      className: 'mt-1 rounded-xl border border-slate-200 p-3 bg-slate-50/50',
      children: [
        e.jsx('div', {
          className: 'grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3',
          children: Tt.map((t) =>
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
        l === 'system' && e.jsx(zt, { codigo: s.codigo_producto, value: c, onSelect: f }),
        l === 'manual' &&
          e.jsx('input', {
            value: c,
            onChange: (t) => f(t.target.value.toUpperCase()),
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
    onSaved: f
  }) => {
    const { user: t } = ve(),
      h = ia(),
      u = !!s,
      C = Ja(),
      p = Wa(),
      { data: O } = hs(u ? s.id : null),
      x = (l == null ? void 0 : l.id) || c || null,
      [I, N] = j.useState((s == null ? void 0 : s.bodega) || ''),
      [b, L] = j.useState((s == null ? void 0 : s.periodicidad) || 'SEMANAL'),
      [P, M] = j.useState((s == null ? void 0 : s.observaciones) || ''),
      [R, _] = j.useState(''),
      [o, a] = j.useState(!1),
      [m, n] = j.useState([]),
      [v, g] = j.useState(!1),
      [D, Q] = j.useState([]),
      [J, F] = j.useState(null),
      [W, A] = j.useState([]),
      [Z, te] = j.useState(!x),
      [X, z] = j.useState({ status: 'idle', savedAt: null, error: '' }),
      [V, ee] = j.useState(
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
      Y = j.useRef(!1);
    j.useEffect(() => {
      u &&
        O &&
        !Y.current &&
        ((Y.current = !0),
        Q(
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
    const w = j.useRef(!1);
    j.useEffect(() => {
      var i, $, U;
      if (!u && x && !w.current) {
        w.current = !0;
        const r = l == null ? void 0 : l.progress_data,
          k = Array.isArray(r == null ? void 0 : r.items) ? r.items : null;
        if (k != null && k.length) {
          (N(((i = r == null ? void 0 : r.header) == null ? void 0 : i.bodega) || ''),
            L((($ = r == null ? void 0 : r.header) == null ? void 0 : $.periodicidad) || 'SEMANAL'),
            M(((U = r == null ? void 0 : r.header) == null ? void 0 : U.observaciones) || ''),
            A(Array.isArray(r == null ? void 0 : r.selected_sku_ids) ? r.selected_sku_ids : []),
            Q(
              k.map((K, ne) => ({
                ...K,
                _key:
                  K._key ||
                  `${K.codigo_producto}|${K.batch_value || K.partida || ''}|${K.ubicacion || ''}|${ne}`,
                revision_estado: K.revision_estado || 'PENDIENTE',
                batch_source: K.batch_source || (K.partida ? 'system' : 'none'),
                batch_value: K.batch_value ?? K.partida ?? null
              }))
            ),
            z({
              status: 'saved',
              savedAt:
                (l == null ? void 0 : l.progress_updated_at) ||
                (r == null ? void 0 : r.saved_at) ||
                null,
              error: ''
            }),
            te(!0));
          return;
        }
        const B = Array.isArray(d) ? d : (l == null ? void 0 : l.skus) || [];
        (Q(
          B.map((K) => ({
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
          te(!0));
      }
    }, [l, u, d, x]);
    const G = j.useCallback(async () => {
        g(!0);
        try {
          const i = await bs(R, o);
          n(i);
        } catch (i) {
          S.error(`Error buscando stock: ${i.message}`);
        } finally {
          g(!1);
        }
      }, [R, o]),
      q = (i) => {
        const $ = `${i.codigo_producto}|${i.partida || ''}|${i.ubicacion || ''}`;
        if (D.some((U) => U._key === $)) {
          S.info('Ese ítem ya está en el informe');
          return;
        }
        Q((U) => [
          ...U,
          {
            _key: $,
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
      re = () => {
        const i = (J.codigo || '').trim().toUpperCase(),
          $ = (J.ubicacion || '').trim().toUpperCase();
        if (!i) {
          S.error('Ingresa el código del producto');
          return;
        }
        if (!$) {
          S.error('La ubicación es obligatoria');
          return;
        }
        const U = `MAN|${i}|${(J.partida || '').trim()}|${$}`;
        if (D.some((r) => r._key === U)) {
          S.info('Ese ítem ya está en el informe');
          return;
        }
        (Q((r) => [
          ...r,
          {
            _key: U,
            codigo_producto: i,
            partida: (J.partida || '').trim().toUpperCase(),
            ubicacion: $,
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
      se = (i, $, U) => {
        Q((r) => r.map((k) => (k._key === i ? { ...k, [$]: U } : k)));
      },
      de = (i, $) => {
        Q((U) => U.map((r) => (r._key === i ? { ...r, ...$ } : r)));
      },
      _e = (i, $) =>
        Q((U) =>
          U.map((r) =>
            r._key === i
              ? {
                  ...r,
                  condicion_observada: $,
                  revision_estado: $ === 'OK' ? 'APROBADO' : 'RECHAZADO',
                  ...($ === 'OK' ? { cantidad_afectada: 0 } : {})
                }
              : r
          )
        ),
      be = (i) => {
        (Q(($) => $.filter((U) => U._key !== i)), A(($) => $.filter((U) => U !== i)));
      },
      le = (i) => A(($) => ($.includes(i) ? $.filter((U) => U !== i) : [...$, i])),
      we = () => A((i) => (i.length === D.length ? [] : D.map(($) => $._key))),
      he = (i) => {
        if (W.length === 0) {
          S.info('Selecciona uno o más SKUs');
          return;
        }
        Q(($) =>
          $.map((U) =>
            W.includes(U._key)
              ? i === 'APROBADO'
                ? {
                    ...U,
                    revision_estado: 'APROBADO',
                    condicion_observada: 'OK',
                    cantidad_afectada: 0
                  }
                : {
                    ...U,
                    revision_estado: 'RECHAZADO',
                    condicion_observada:
                      U.condicion_observada === 'OK' ? 'Daño de producto' : U.condicion_observada
                  }
              : U
          )
        );
      },
      ye = j.useMemo(
        () => ({
          version: 1,
          saved_at: new Date().toISOString(),
          header: { bodega: I, periodicidad: b, observaciones: P },
          items: D,
          selected_sku_ids: W
        }),
        [I, D, P, b, W]
      );
    j.useEffect(() => {
      if (!x || !Z || X.status === 'conflict') return;
      z(($) => ({ ...$, status: 'pending', error: '' }));
      const i = window.setTimeout(async () => {
        z(($) => ({ ...$, status: 'saving', error: '' }));
        try {
          const $ = await Qa(x, ye);
          (z({
            status: 'saved',
            savedAt: ($ == null ? void 0 : $.saved_at) || new Date().toISOString(),
            error: ''
          }),
            ee({
              name:
                ($ == null ? void 0 : $.locked_by_name) ||
                (V == null ? void 0 : V.name) ||
                (t == null ? void 0 : t.nombre) ||
                'Usuario actual',
              at: ($ == null ? void 0 : $.locked_at) || new Date().toISOString()
            }));
        } catch ($) {
          const U =
            ($ == null ? void 0 : $.code) === 'QUALITY_TASK_LOCKED' ||
            ($ == null ? void 0 : $.status) === 409;
          z({
            status: U ? 'conflict' : 'error',
            savedAt: null,
            error: ($ == null ? void 0 : $.message) || 'No se pudo guardar el progreso'
          });
        }
      }, 1500);
      return () => window.clearTimeout(i);
    }, [Z, ye, x, t == null ? void 0 : t.nombre]);
    const y = async () => {
        if (x && X.status !== 'conflict')
          try {
            await nt(x);
          } catch (i) {
            console.warn('No se pudo liberar el bloqueo de Calidad', i);
          }
        E();
      },
      T = async (i) => {
        if (D.length === 0) {
          S.error('Agrega al menos un ítem');
          return;
        }
        if (i === 'ENVIADO_CALIDAD') {
          const U = D.filter((B) => !(B.ubicacion || '').trim());
          if (U.length > 0) {
            S.error(`${U.length} ítem(s) sin ubicación. Es obligatoria para enviar a Calidad.`);
            return;
          }
          const r = D.filter(
            (B) =>
              ['system', 'manual'].includes(B.batch_source) &&
              !(B.batch_value || B.partida || '').trim()
          );
          if (r.length > 0) {
            S.error(`${r.length} ítem(s) requieren elegir o escribir el lote.`);
            return;
          }
          const k = D.filter((B) => B.revision_estado === 'PENDIENTE');
          if (x && k.length > 0) {
            S.error(`Aún faltan ${k.length} SKU(s) por aprobar o rechazar.`);
            return;
          }
        }
        const $ = D.map(({ _key: U, ...r }) => r);
        try {
          if (x) {
            const r = await Zs(x);
            ee({
              name:
                (r == null ? void 0 : r.locked_by_name) ||
                (t == null ? void 0 : t.nombre) ||
                'Usuario actual',
              at: (r == null ? void 0 : r.locked_at) || new Date().toISOString()
            });
          }
          let U = u ? s.id : null;
          if (u) {
            const r = { bodega: I || null, periodicidad: b, estado: i, observaciones: P || null };
            (await p.mutateAsync({ informeId: s.id, cabecera: r, items: $ }),
              S.success('Informe actualizado'));
          } else {
            const r = {
                fecha: new Date().toISOString().slice(0, 10),
                analista_id: (t == null ? void 0 : t.id) || null,
                analista_nombre: (t == null ? void 0 : t.nombre) || null,
                bodega: I || null,
                periodicidad: b,
                estado: i,
                observaciones: P || null
              },
              k = await C.mutateAsync({
                cabecera: r,
                items: $,
                asignacionId: i === 'ENVIADO_CALIDAD' ? x : null
              });
            ((U = (k == null ? void 0 : k.id) || null),
              S.success(
                i === 'ENVIADO_CALIDAD' ? 'Informe enviado a Calidad' : 'Borrador guardado'
              ),
              x &&
                (k == null ? void 0 : k.asignacion_estado) === 'RESUELTA' &&
                S.success('Asignación de estancia resuelta'));
          }
          if (i === 'ENVIADO_CALIDAD' && U)
            try {
              const r = await lt(U);
              ((r == null ? void 0 : r.flags) > 0 &&
                (h.invalidateQueries({ queryKey: ['calidad_flags'] }),
                S.info(`${r.flags} ubicación(es) marcadas "En Auditoría"`)),
                (r == null ? void 0 : r.alertas) > 0 &&
                  (S.warning(`${r.alertas} alerta(s) a Inventario por SKU no registrado`),
                  it(r.alertas, U)));
            } catch (r) {
              console.error('preliminar', r);
            }
          f();
        } catch (U) {
          S.error(`Error al guardar: ${U.message}`);
        }
      },
      H = D.filter((i) => !(i.ubicacion || '').trim()).length,
      ae = D.filter((i) => i.revision_estado !== 'PENDIENTE').length,
      oe = D.length > 0 ? Math.round((ae / D.length) * 100) : 0,
      xe = (i, $) =>
        $
          ? i === 'OK'
            ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
            : 'bg-amber-100 text-amber-800 border-amber-300'
          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100',
      ie = C.isPending || p.isPending;
    return X.status === 'conflict'
      ? e.jsxs('div', {
          className: 'space-y-4',
          children: [
            e.jsxs('button', {
              onClick: y,
              className:
                'flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700',
              children: [e.jsx(Se, { size: 17 }), ' Volver a las tareas']
            }),
            e.jsxs('div', {
              className: 'rounded-2xl border border-rose-300 bg-rose-50 p-6 text-rose-900',
              children: [
                e.jsx('h2', { className: 'text-lg font-black', children: 'Edición bloqueada' }),
                e.jsx('p', { className: 'mt-2 text-sm font-bold', children: X.error }),
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
                  onClick: y,
                  className:
                    'p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm',
                  children: e.jsx(Se, { size: 22 })
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
                        children: [ae, '/', D.length, ' SKUs · ', oe, '%']
                      })
                    ]
                  }),
                  e.jsx('div', {
                    className: 'h-2.5 overflow-hidden rounded-full bg-slate-100',
                    children: e.jsx('div', {
                      className: 'h-full rounded-full bg-emerald-500 transition-all duration-300',
                      style: { width: `${oe}%` }
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
                  e.jsx(pe, { size: 18, className: 'shrink-0 mt-0.5' }),
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
                      value: I,
                      onChange: (i) => N(i.target.value),
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
                      onChange: (i) => L(i.target.value),
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
                        e.jsx(ue, {
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
                      disabled: v,
                      className:
                        'px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700 disabled:opacity-50',
                      children: [
                        v
                          ? e.jsx(ce, { size: 16, className: 'animate-spin' })
                          : e.jsx(ue, { size: 16 }),
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
                    children: m.map((i, $) =>
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
                                  className: `w-2.5 h-2.5 rounded-full ${os[i.semaforo] || 'bg-slate-300'}`
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
                        $
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
                      children: ['Ítems del informe (', D.length, ')']
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center gap-2',
                      children: [
                        H > 0 &&
                          e.jsxs('span', {
                            className:
                              'text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full flex items-center gap-1',
                            children: [e.jsx(pe, { size: 12 }), ' ', H, ' sin ubicación']
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
                D.length > 0 &&
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
                            checked: W.length === D.length,
                            onChange: we,
                            className: 'h-4 w-4 rounded border-slate-300 accent-emerald-600'
                          }),
                          'Seleccionar todos (',
                          W.length,
                          '/',
                          D.length,
                          ')'
                        ]
                      }),
                      e.jsx('button', {
                        type: 'button',
                        onClick: () => he('APROBADO'),
                        className:
                          'rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700',
                        children: 'Aprobar seleccionados'
                      }),
                      e.jsx('button', {
                        type: 'button',
                        onClick: () => he('RECHAZADO'),
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
                          e.jsx(pe, { size: 15 }),
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
                                  F(($) => ({ ...$, codigo: i.target.value.toUpperCase() })),
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
                                  F(($) => ({ ...$, ubicacion: i.target.value.toUpperCase() })),
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
                                  F(($) => ({ ...$, partida: i.target.value.toUpperCase() })),
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
                                  F(($) => ({ ...$, cantidad: Number(i.target.value) || 0 })),
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
                                onChange: (i) => F(($) => ({ ...$, producto: i.target.value })),
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
                          e.jsx(pe, { size: 12 }),
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
                            onClick: re,
                            className:
                              'px-4 py-2 rounded-xl bg-amber-600 text-white font-black text-sm hover:bg-amber-700 flex items-center gap-1.5',
                            children: [e.jsx(Ee, { size: 15 }), ' Agregar']
                          })
                        ]
                      })
                    ]
                  }),
                D.length === 0
                  ? e.jsx('p', {
                      className: 'text-sm text-slate-400 py-6 text-center',
                      children: 'Busca y agrega productos al informe.'
                    })
                  : e.jsx('div', {
                      className: 'space-y-3',
                      children: D.map((i) => {
                        const $ = i.condicion_observada !== 'OK',
                          U = !(i.ubicacion || '').trim();
                        return e.jsxs(
                          'div',
                          {
                            className: `rounded-xl border p-4 ${$ ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`,
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
                                        onChange: () => le(i._key),
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
                                                className: `w-2 h-2 rounded-full ${os[i.semaforo] || 'bg-slate-300'}`
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
                                    onClick: () => be(i._key),
                                    className:
                                      'p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 shrink-0',
                                    children: e.jsx(me, { size: 15 })
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3',
                                children: [
                                  e.jsx('div', {
                                    className: 'col-span-2',
                                    children: e.jsx($t, { item: i, onChange: (r) => de(i._key, r) })
                                  }),
                                  e.jsxs('div', {
                                    className: 'col-span-2',
                                    children: [
                                      e.jsxs('label', {
                                        className:
                                          'text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1',
                                        children: [
                                          'Ubicación ',
                                          U &&
                                            e.jsx('span', {
                                              className: 'text-rose-500',
                                              children: '*obligatoria'
                                            })
                                        ]
                                      }),
                                      e.jsx('input', {
                                        value: i.ubicacion,
                                        onChange: (r) =>
                                          se(i._key, 'ubicacion', r.target.value.toUpperCase()),
                                        placeholder: 'Ej. A-12-03',
                                        className: `w-full mt-1 px-3 py-2 rounded-xl border text-sm font-mono font-bold outline-none focus:border-emerald-400 ${U ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'}`
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
                                          se(i._key, 'cantidad', Number(r.target.value) || 0),
                                        className:
                                          'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400'
                                      })
                                    ]
                                  }),
                                  $ &&
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
                                            se(
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
                                    children: Za.map((r) =>
                                      e.jsxs(
                                        'button',
                                        {
                                          type: 'button',
                                          onClick: () => _e(i._key, r),
                                          className: `text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${xe(r, i.condicion_observada === r)}`,
                                          children: [
                                            r !== 'OK' &&
                                              i.condicion_observada === r &&
                                              e.jsx(pe, {
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
                                  onChange: (r) => se(i._key, 'observaciones', r.target.value),
                                  placeholder: 'Nota / observación',
                                  className:
                                    'flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400'
                                })
                              }),
                              $ &&
                                !U &&
                                e.jsxs('p', {
                                  className:
                                    'mt-2 text-[11px] text-amber-700 bg-amber-100/60 rounded-lg px-3 py-1.5 flex items-center gap-1.5',
                                  children: [
                                    e.jsx(pe, { size: 12 }),
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
                        onClick: () => T(u ? s.estado : 'BORRADOR'),
                        disabled: ie,
                        className:
                          'px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 disabled:opacity-50',
                        children: u ? 'Guardar cambios' : 'Guardar borrador'
                      }),
                    !u &&
                      e.jsxs('button', {
                        onClick: () => T('ENVIADO_CALIDAD'),
                        disabled: ie,
                        className:
                          'px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50',
                        children: [
                          ie
                            ? e.jsx(ce, { size: 16, className: 'animate-spin' })
                            : e.jsx(Gs, { size: 16 }),
                          ' Enviar a Calidad'
                        ]
                      })
                  ]
                }),
                x &&
                  e.jsx('div', {
                    className: `mt-4 text-right text-xs font-bold ${X.status === 'error' ? 'text-rose-600' : 'text-slate-500'}`,
                    children:
                      X.status === 'saving' || X.status === 'pending'
                        ? '⏳ Guardando...'
                        : X.status === 'error'
                          ? `🔴 No se pudo autoguardar: ${X.error}`
                          : X.savedAt
                            ? `🟢 Todos los cambios guardados - ${new Date(X.savedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
                            : 'Autoguardado listo'
                  })
              ]
            })
          ]
        });
  },
  Is = {
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
  zs = ({ informe: s, prefill: d, onCancel: l, onSaved: c }) => {
    var Y;
    const { user: E } = ve(),
      f = Ya(),
      { data: t } = hs((s == null ? void 0 : s.id) || null),
      h =
        !s && d
          ? {
              antecedentes: `Recepción ${d.oc || 's/OC'} de ${d.proveedor || 's/proveedor'} (${d.origen === 'NACIONAL' ? 'Nacional' : 'Importación'}) resultó NO CONFORME en el CheckList de ingreso. Se levanta el presente Informe de Daños / Solicitud de No Conformidad al proveedor.`,
              fecha_recepcion: d.fecha_recepcion || Is.fecha_recepcion
            }
          : {},
      [u, C] = j.useState((s == null ? void 0 : s.id) || null),
      [p, O] = j.useState((s == null ? void 0 : s.numero) || ''),
      [x, I] = j.useState((s == null ? void 0 : s.bodega) || ''),
      [N, b] = j.useState((s == null ? void 0 : s.estado) || 'BORRADOR'),
      [L, P] = j.useState({
        ...Is,
        ...((s == null ? void 0 : s.reporte) || {}),
        ...h,
        elaborado_por:
          ((Y = s == null ? void 0 : s.reporte) == null ? void 0 : Y.elaborado_por) ||
          (E == null ? void 0 : E.nombre) ||
          ''
      }),
      [M, R] = j.useState([]),
      { data: _ = [], refetch: o } = Xa(u),
      a = j.useRef(!1);
    j.useEffect(() => {
      s != null &&
        s.id &&
        t &&
        !a.current &&
        ((a.current = !0),
        R(
          t.map((w) => ({
            id: w.id,
            _key: w.id,
            codigo_producto: w.codigo_producto || '',
            producto: w.producto || '',
            partida: w.partida || '',
            ubicacion: w.ubicacion || '',
            unidad_medida: w.unidad_medida || '',
            cantidad: Number(w.cantidad) || 0,
            tipo_dano: w.tipo_dano || '',
            componente_afectado: w.componente_afectado || '',
            consecuencia: w.consecuencia || '',
            observaciones: w.observaciones || ''
          }))
        ));
    }, [s == null ? void 0 : s.id, t]);
    const m = (w, G) => P((q) => ({ ...q, [w]: G })),
      n = () =>
        R((w) => [
          ...w,
          {
            _key: `tmp-${It()}`,
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
      v = (w, G, q) => R((re) => re.map((se) => (se._key === w ? { ...se, [G]: q } : se))),
      g = (w) => R((G) => G.filter((q) => q._key !== w)),
      D = () =>
        P((w) => ({
          ...w,
          cuadro_resumen: [...(w.cuadro_resumen || []), { indicador: '', valor: '' }]
        })),
      Q = (w, G, q) =>
        P((re) => ({
          ...re,
          cuadro_resumen: re.cuadro_resumen.map((se, de) => (de === w ? { ...se, [G]: q } : se))
        })),
      J = (w) => P((G) => ({ ...G, cuadro_resumen: G.cuadro_resumen.filter((q, re) => re !== w) })),
      F = () =>
        P((w) => ({ ...w, acciones_recomendadas: [...(w.acciones_recomendadas || []), ''] })),
      W = (w, G) =>
        P((q) => ({
          ...q,
          acciones_recomendadas: q.acciones_recomendadas.map((re, se) => (se === w ? G : re))
        })),
      A = (w) =>
        P((G) => ({
          ...G,
          acciones_recomendadas: G.acciones_recomendadas.filter((q, re) => re !== w)
        })),
      Z = async (w) => {
        const G = w || N;
        try {
          const q = u
              ? {
                  bodega: x || null,
                  periodicidad: 'ADHOC',
                  estado: G,
                  observaciones: L.descripcion_hallazgo || null
                }
              : {
                  fecha: new Date().toISOString().slice(0, 10),
                  analista_id: (E == null ? void 0 : E.id) || null,
                  analista_nombre: (E == null ? void 0 : E.nombre) || null,
                  bodega: x || null,
                  periodicidad: 'ADHOC',
                  estado: G,
                  observaciones: L.descripcion_hallazgo || null
                },
            re = M.map(({ _key: de, ..._e }) => _e),
            se = await f.mutateAsync({ informeId: u, cabecera: q, reporte: L, hallazgos: re });
          (C(se.id),
            se.numero && O(se.numero),
            b(G),
            R(se.hallazgos.map((de) => ({ ...de, _key: de.id }))),
            o(),
            S.success('Informe de daños guardado'));
        } catch (q) {
          S.error(`Error al guardar: ${q.message}`);
        }
      },
      te = {
        id: u,
        numero: p,
        fecha: (s == null ? void 0 : s.fecha) || L.fecha_recepcion,
        bodega: x,
        analista_nombre: L.elaborado_por || (E == null ? void 0 : E.nombre),
        reporte: L
      },
      X = async (w) => {
        if (!u) {
          S.error('Guarda el informe antes de exportar');
          return;
        }
        try {
          w === 'word' ? await gt(te, M, _) : await ft(te, M, _);
        } catch (G) {
          S.error(`Error al exportar: ${G.message}`);
        }
      },
      z =
        'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-400',
      V = 'text-[10px] font-black text-slate-400 uppercase tracking-widest',
      ee = (w) => _.filter((G) => G.item_id === w);
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
                  children: e.jsx(Se, { size: 22 })
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
                  onClick: () => X('word'),
                  disabled: !u,
                  className:
                    'px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-blue-700 disabled:opacity-40',
                  children: [e.jsx(Re, { size: 16 }), ' Word']
                }),
                e.jsxs('button', {
                  onClick: () => X('pdf'),
                  disabled: !u,
                  className:
                    'px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-rose-700 disabled:opacity-40',
                  children: [e.jsx(Hs, { size: 16 }), ' PDF']
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
                  value: L.fecha_recepcion || '',
                  onChange: (w) => m('fecha_recepcion', w.target.value),
                  className: z
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: V, children: 'Tipo de producto' }),
                e.jsx('input', {
                  value: L.tipo_producto,
                  onChange: (w) => m('tipo_producto', w.target.value),
                  placeholder: 'Ej. Biombos (divisores modulares)',
                  className: z
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: V, children: 'Área responsable' }),
                e.jsx('input', {
                  value: L.area_responsable,
                  onChange: (w) => m('area_responsable', w.target.value),
                  className: z
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: V, children: 'Clasificación' }),
                e.jsx('select', {
                  value: L.clasificacion,
                  onChange: (w) => m('clasificacion', w.target.value),
                  className: z,
                  children: Qs.map((w) => e.jsx('option', { value: w, children: w }, w))
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: V, children: 'Bodega' }),
                e.jsx('input', {
                  value: x,
                  onChange: (w) => I(w.target.value),
                  placeholder: 'Ej. BD 21',
                  className: z
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
                  value: L.antecedentes,
                  onChange: (w) => m('antecedentes', w.target.value),
                  className: z
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: V, children: '2. Descripción del hallazgo' }),
                e.jsx('textarea', {
                  rows: 3,
                  value: L.descripcion_hallazgo,
                  onChange: (w) => m('descripcion_hallazgo', w.target.value),
                  className: z
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
                  children: M.map((w, G) =>
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
                                onClick: () => g(w._key),
                                className:
                                  'p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50',
                                children: e.jsx(me, { size: 15 })
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
                                    value: w.tipo_dano,
                                    onChange: (q) => v(w._key, 'tipo_dano', q.target.value),
                                    placeholder: 'Deformación por aplastamiento',
                                    className: z
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', { className: V, children: 'Componente afectado' }),
                                  e.jsx('input', {
                                    value: w.componente_afectado,
                                    onChange: (q) =>
                                      v(w._key, 'componente_afectado', q.target.value),
                                    placeholder: 'Pilar / Panel',
                                    className: z
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', { className: V, children: 'Cantidad afectada' }),
                                  e.jsx('input', {
                                    type: 'number',
                                    value: w.cantidad,
                                    onChange: (q) => v(w._key, 'cantidad', q.target.value),
                                    className: z
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
                                    value: w.codigo_producto,
                                    onChange: (q) => v(w._key, 'codigo_producto', q.target.value),
                                    placeholder: 'SKU',
                                    className: z
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
                                    value: w.ubicacion,
                                    onChange: (q) => v(w._key, 'ubicacion', q.target.value),
                                    className: z
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', { className: V, children: 'Lote (opcional)' }),
                                  e.jsx('input', {
                                    value: w.partida,
                                    onChange: (q) => v(w._key, 'partida', q.target.value),
                                    className: z
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'sm:col-span-3',
                                children: [
                                  e.jsx('label', { className: V, children: 'Consecuencia' }),
                                  e.jsx('input', {
                                    value: w.consecuencia,
                                    onChange: (q) => v(w._key, 'consecuencia', q.target.value),
                                    placeholder: 'No apto para despacho hasta evaluación técnica',
                                    className: z
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'sm:col-span-3',
                                children: [
                                  e.jsx('label', { className: V, children: 'Observaciones' }),
                                  e.jsx('input', {
                                    value: w.observaciones,
                                    onChange: (q) => v(w._key, 'observaciones', q.target.value),
                                    className: z
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
                                children: e.jsx(_t, {
                                  informeId: u,
                                  itemId: w.id,
                                  evidencias: ee(w.id),
                                  onChanged: o
                                })
                              })
                            ]
                          })
                        ]
                      },
                      w._key
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
                  onClick: D,
                  className:
                    'px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-slate-700',
                  children: [e.jsx(Ee, { size: 14 }), ' Fila']
                })
              ]
            }),
            e.jsx('div', {
              className: 'space-y-2',
              children: (L.cuadro_resumen || []).map((w, G) =>
                e.jsxs(
                  'div',
                  {
                    className: 'flex gap-2 items-center',
                    children: [
                      e.jsx('input', {
                        value: w.indicador,
                        onChange: (q) => Q(G, 'indicador', q.target.value),
                        placeholder: 'Indicador (ej. Total de bultos recepcionados)',
                        className: `${z} mt-0 flex-1`
                      }),
                      e.jsx('input', {
                        value: w.valor,
                        onChange: (q) => Q(G, 'valor', q.target.value),
                        placeholder: 'Valor',
                        className: `${z} mt-0 w-32`
                      }),
                      e.jsx('button', {
                        onClick: () => J(G),
                        className:
                          'p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50',
                        children: e.jsx(me, { size: 15 })
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
                  value: L.analisis_causa,
                  onChange: (w) => m('analisis_causa', w.target.value),
                  className: z
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
                  children: (L.acciones_recomendadas || []).map((w, G) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'flex gap-2 items-center',
                        children: [
                          e.jsx('input', {
                            value: w,
                            onChange: (q) => W(G, q.target.value),
                            placeholder: 'Acción recomendada',
                            className: `${z} mt-0 flex-1`
                          }),
                          e.jsx('button', {
                            onClick: () => A(G),
                            className:
                              'p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50',
                            children: e.jsx(me, { size: 15 })
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
                  value: L.elaborado_por,
                  onChange: (w) => m('elaborado_por', w.target.value),
                  className: z
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: V, children: 'Revisado por' }),
                e.jsx('input', {
                  value: L.revisado_por,
                  onChange: (w) => m('revisado_por', w.target.value),
                  className: z
                })
              ]
            })
          ]
        }),
        e.jsxs('div', {
          className: 'flex justify-end gap-3',
          children: [
            e.jsxs('button', {
              onClick: () => Z('BORRADOR'),
              disabled: f.isPending,
              className:
                'px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2',
              children: [
                f.isPending
                  ? e.jsx(ce, { size: 16, className: 'animate-spin' })
                  : e.jsx(fa, { size: 16 }),
                ' ',
                'Guardar'
              ]
            }),
            e.jsxs('button', {
              onClick: () => Z('ENVIADO_CALIDAD'),
              disabled: f.isPending,
              className:
                'px-5 py-2.5 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center gap-2 hover:bg-rose-700 disabled:opacity-50',
              children: [e.jsx(Gs, { size: 16 }), ' Guardar y enviar']
            })
          ]
        })
      ]
    });
  },
  Lt = ({ informe: s, onBack: d, onEdit: l, onDelete: c }) => {
    var _;
    const { hasPermission: E } = ve(),
      f = E('manage_quality'),
      { data: t = [], isLoading: h } = hs(s.id),
      u = et(),
      C = st(),
      { data: p = [] } = at(),
      { data: O = [] } = tt(),
      x = ot(),
      [I, N] = j.useState({}),
      b = (o, a) => N((m) => ({ ...m, [o]: { ...m[o], ...a } })),
      L = async (o) => {
        var n;
        const a = I[o.id] || {};
        if (!a.dictamen) {
          S.error('Selecciona un dictamen');
          return;
        }
        const m = Ge.find((v) => v.id === a.dictamen);
        if (m != null && m.mueve && !a.bodegaDestino) {
          S.error('Indica la bodega destino');
          return;
        }
        if (a.tipoAccion) {
          const v = Be.find((g) => g.id === a.tipoAccion);
          if (!(a.area || (v != null && v.area))) {
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
              ct({
                codigo: o.codigo_producto,
                ubicacion: o.ubicacion,
                estadoLabel: (m == null ? void 0 : m.label) || a.dictamen,
                tipo: 'CALIDAD_DICTAMEN'
              }),
            a.tipoAccion)
          ) {
            const v = Be.find((D) => D.id === a.tipoAccion),
              g = a.area || (v == null ? void 0 : v.area);
            if (!g) {
              S.error('Selecciona el área responsable de la acción');
              return;
            }
            try {
              const D = await C.mutateAsync({
                itemId: o.id,
                tipoAccion: a.tipoAccion,
                area: g,
                descripcion: a.descAccion,
                prioridad: a.prioridad || 'NORMAL'
              });
              S.success(
                `Acción promulgada ${(D == null ? void 0 : D.folio) || ''} → ${((n = p.find((Q) => Q.codigo === g)) == null ? void 0 : n.label) || g}`
              );
            } catch (D) {
              S.error(`Dictamen OK, pero no se pudo crear la acción: ${D.message}`);
            }
          }
        } catch (v) {
          S.error(`Error: ${v.message}`);
        }
      },
      P = () => {
        const o = t.map((g) => ({
            SKU: g.codigo_producto,
            Lote_Serie: g.partida,
            Ubicacion: g.ubicacion,
            Producto: g.producto,
            UM: g.unidad_medida,
            Cantidad: g.cantidad,
            Uds_Afectadas: g.cantidad_afectada || 0,
            No_Registrado: g.no_registrado ? 'SÍ' : '',
            Estado_Inv: g.estado_inventario,
            Tipo: g.tipo,
            Vence: g.fecha_vencimiento,
            Semaforo: g.semaforo,
            Condicion: g.condicion_observada,
            Motivo: g.motivo,
            Observaciones: g.observaciones,
            Dictamen: g.dictamen || '',
            Bodega_Destino: g.bodega_destino || '',
            Acuse: g.acuse_texto || '',
            Calidad: g.calidad_nombre || '',
            Fecha_Dictamen: g.fecha_dictamen || ''
          })),
          a = (g) => t.filter(g).length,
          m = ['LIBERAR', 'CUARENTENA', 'REPROCESO', 'RECHAZAR', 'BAJA'],
          n = [...new Set(t.map((g) => g.condicion_observada).filter(Boolean))],
          v = [
            { Campo: 'Informe', Valor: s.numero },
            { Campo: 'Fecha', Valor: s.fecha },
            { Campo: 'Bodega', Valor: s.bodega || '—' },
            { Campo: 'Analista', Valor: s.analista_nombre || '—' },
            { Campo: 'Estado', Valor: s.estado },
            { Campo: 'Total ítems', Valor: t.length },
            { Campo: 'Dictaminados', Valor: a((g) => g.dictamen) },
            { Campo: 'Pendientes', Valor: a((g) => !g.dictamen) },
            {
              Campo: 'Con problema (cond≠OK)',
              Valor: a((g) => g.condicion_observada && g.condicion_observada !== 'OK')
            },
            { Campo: 'No registrados', Valor: a((g) => g.no_registrado) },
            { Campo: '— Por semáforo —', Valor: '' },
            ...['ROJO', 'NARANJA', 'VERDE', 'NA'].map((g) => ({
              Campo: `Semáforo ${g}`,
              Valor: a((D) => D.semaforo === g)
            })),
            { Campo: '— Por dictamen —', Valor: '' },
            ...m.map((g) => ({ Campo: g, Valor: a((D) => D.dictamen === g) })),
            { Campo: '— Por condición —', Valor: '' },
            ...n.map((g) => ({ Campo: g, Valor: a((D) => D.condicion_observada === g) }))
          ];
        _a({
          filename: `Monitoreo_${s.numero}`,
          sheets: [
            { name: 'Resumen', rows: v },
            { name: 'Detalle', rows: o }
          ]
        });
      },
      M = j.useMemo(() => t.filter((o) => !o.dictamen).length, [t]),
      R = j.useMemo(() => {
        const o = t.length,
          a = t.filter((g) => g.dictamen).length,
          m = t.filter((g) => g.no_registrado).length,
          n = t.filter((g) => g.condicion_observada && g.condicion_observada !== 'OK').length,
          v = { ROJO: 0, NARANJA: 0, VERDE: 0, NA: 0 };
        return (
          t.forEach((g) => {
            v[g.semaforo] = (v[g.semaforo] || 0) + 1;
          }),
          {
            total: o,
            dictaminados: a,
            noReg: m,
            conProblema: n,
            sem: v,
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
                  children: e.jsx(Se, { size: 22 })
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
                    children: [e.jsx(me, { size: 16 }), ' Eliminar']
                  }),
                e.jsxs('button', {
                  onClick: () => jt(s, t),
                  title: 'Descargar Word',
                  className:
                    'px-3 py-2.5 bg-white border border-slate-200 text-blue-700 rounded-xl text-sm font-black flex items-center gap-1.5 hover:bg-blue-50',
                  children: [e.jsx(Re, { size: 16 }), ' Word']
                }),
                e.jsxs('button', {
                  onClick: () => vt(s, t),
                  title: 'Descargar PDF',
                  className:
                    'px-3 py-2.5 bg-white border border-slate-200 text-rose-700 rounded-xl text-sm font-black flex items-center gap-1.5 hover:bg-rose-50',
                  children: [e.jsx(Hs, { size: 16 }), ' PDF']
                }),
                e.jsxs('button', {
                  onClick: P,
                  className:
                    'px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700',
                  children: [e.jsx(Na, { size: 16 }), ' Excel']
                })
              ]
            })
          ]
        }),
        !h &&
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
        h
          ? e.jsx('div', {
              className: 'flex justify-center py-16',
              children: e.jsx(ce, { className: 'animate-spin text-emerald-500', size: 32 })
            })
          : e.jsx('div', {
              className: 'space-y-3',
              children: t.map((o) => {
                const a = I[o.id] || {},
                  m = Ge.find((n) => n.id === a.dictamen);
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
                                className: `w-2.5 h-2.5 rounded-full ${os[o.semaforo] || 'bg-slate-300'}`
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
                                  e.jsx(xt, { estado: Pt(o.dictamen) }),
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
                      f &&
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
                                    Ge.map((n) =>
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
                                        rt.map((n) =>
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
                                    const v = Be.find((g) => g.id === n.target.value);
                                    b(o.id, {
                                      tipoAccion: n.target.value,
                                      area: (v == null ? void 0 : v.area) || a.area
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
                              onClick: () => L(o),
                              disabled: u.isPending || C.isPending,
                              className:
                                'px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50',
                              children: [e.jsx(We, { size: 16 }), ' Dictaminar']
                            })
                          ]
                        })
                    ]
                  },
                  o.id
                );
              })
            }),
        f &&
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
              children: [e.jsx(ja, { size: 16 }), ' Cerrar dictamen del informe']
            })
          })
      ]
    });
  };
function Pt(s) {
  const d = Ge.find((l) => l.id === s);
  return (d == null ? void 0 : d.estado) || 'LIBERADO';
}
const Yt = () => {
  const { hasPermission: s, user: d } = ve(),
    l = s('manage_monitoreo') || s('manage_quality'),
    E = (d == null ? void 0 : d.rol) === 'ADMIN' || (d == null ? void 0 : d.es_admin_delegado),
    { data: f = [], isLoading: t } = Ga(),
    h = Ha(),
    [u, C] = j.useState('list'),
    [p, O] = j.useState(null),
    [x, I] = j.useState('hito1'),
    [N, b] = j.useState(null),
    [L, P] = j.useState(null),
    [M, R] = j.useState(''),
    _ = Va(),
    o = Ka(),
    a = qa(),
    m = j.useMemo(() => {
      const F = M.trim().toLocaleLowerCase('es-CL');
      return F
        ? f.filter((W) =>
            [
              W.numero,
              W.bodega,
              W.analista_nombre,
              W.estado,
              W.tipo_informe,
              JSON.stringify(W.reporte || {})
            ].some((A) =>
              String(A || '')
                .toLocaleLowerCase('es-CL')
                .includes(F)
            )
          )
        : f;
    }, [M, f]);
  (As('tms_calidad_tareas', ['calidad_tareas'], { debounceMs: 400 }),
    As('tms_calidad_asignaciones', ['calidad_asignaciones'], { debounceMs: 400 }),
    j.useEffect(() => {
      if (u === 'detail' && p) {
        const F = f.find((W) => W.id === p.id);
        F && O(F);
      }
    }, [f]));
  const n = (F) => {
      (O(F), C(F.tipo_informe === 'DANOS' && l ? 'edit-danos' : 'detail'));
    },
    v = (F) => {
      (O(F), C(F.tipo_informe === 'DANOS' ? 'edit-danos' : 'edit'));
    },
    g = async (F) => {
      if (confirm(`¿Eliminar el informe ${F.numero}? Esta acción no se puede deshacer.`))
        try {
          (await h.mutateAsync(F.id),
            S.success('Informe eliminado'),
            (p == null ? void 0 : p.id) === F.id && (O(null), C('list')));
        } catch (W) {
          S.error(`No se pudo eliminar: ${W.message}`);
        }
    },
    D = () => {
      (C('list'), O(null), b(null), P(null));
    },
    Q = (F) => {
      (O(null),
        b({
          proveedor: F.proveedor,
          oc: F.oc,
          origen: F.origen,
          fecha_recepcion: F.fecha_recepcion,
          recepcion_id: F.recepcion_id,
          tarea_id: F.id
        }),
        I('hito2'),
        C('new-danos'));
    },
    J = async (F) => {
      try {
        const W = await Zs(F.id);
        (O(null), P({ ...F, ...W }), I('hito2'), C('new'));
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
                children: e.jsx(ha, { size: 30, strokeWidth: 2.4 })
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
                    (O(null), C('new'));
                  },
                  className:
                    'px-5 py-3 bg-emerald-600 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700',
                  children: [e.jsx(Ee, { size: 20 }), ' Monitoreo']
                }),
                e.jsxs('button', {
                  onClick: () => {
                    (O(null), C('new-danos'));
                  },
                  className:
                    'px-5 py-3 bg-rose-600 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-rose-600/20 hover:bg-rose-700',
                  children: [e.jsx(pe, { size: 20 }), ' Informe de Daños']
                })
              ]
            })
        ]
      }),
      u === 'list' &&
        e.jsx('div', {
          className: 'flex flex-wrap gap-2 mb-5',
          children: [
            { id: 'hito1', n: 1, label: 'Recepción', sub: 'Ingreso a bodega', icon: ga, badge: _ },
            {
              id: 'hito2',
              n: 2,
              label: 'Estancia',
              sub: 'Producto en almacenamiento',
              icon: Us,
              badge: o
            },
            { id: 'hito3', n: 3, label: 'Salida', sub: 'Despacho', icon: Je, badge: a }
          ].map((F) => {
            const W = F.icon,
              A = x === F.id;
            return e.jsxs(
              'button',
              {
                onClick: () => I(F.id),
                className: `px-4 py-2.5 rounded-xl font-black text-sm border transition-colors flex items-center gap-2.5 ${A ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`,
                children: [
                  e.jsx('span', {
                    className: `w-6 h-6 rounded-lg flex items-center justify-center text-[11px] ${A ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`,
                    children: F.n
                  }),
                  e.jsx(W, { size: 16, className: 'shrink-0' }),
                  e.jsxs('span', {
                    className: 'flex flex-col items-start leading-tight',
                    children: [
                      e.jsx('span', { children: F.label }),
                      e.jsx('span', {
                        className: `text-[9px] font-bold ${A ? 'text-white/70' : 'text-slate-400'}`,
                        children: F.sub
                      })
                    ]
                  }),
                  F.badge > 0 &&
                    e.jsx('span', {
                      className: `text-[10px] font-black px-2 py-0.5 rounded-full ${A ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700'}`,
                      children: F.badge
                    })
                ]
              },
              F.id
            );
          })
        }),
      u === 'list' && x === 'hito1' && e.jsx(Et, { onGenerarDanos: Q }),
      u === 'list' && x === 'hito3' && e.jsx(Dt, {}),
      u === 'new' &&
        e.jsx(Ds, {
          prefillItems: L == null ? void 0 : L.skus,
          asignacion: L,
          onCancel: D,
          onSaved: D
        }),
      u === 'edit' && p && e.jsx(Ds, { informe: p, onCancel: D, onSaved: D }),
      u === 'new-danos' && e.jsx(zs, { prefill: N, onCancel: D, onSaved: D }),
      u === 'edit-danos' && p && e.jsx(zs, { informe: p, onCancel: D, onSaved: D }),
      u === 'detail' &&
        p &&
        e.jsx(Lt, { informe: p, onBack: D, onEdit: l ? v : null, onDelete: l ? g : null }),
      u === 'list' &&
        x === 'hito2' &&
        e.jsx(Ot, { canAssign: E, canManageQuality: l, onGenerarInforme: J }),
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
                            e.jsx(ks, { size: 16, className: 'text-emerald-500' }),
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
                        children: [m.length, ' / ', f.length]
                      })
                  ]
                }),
                e.jsxs('label', {
                  className: 'relative mt-3 block',
                  children: [
                    e.jsx(ue, {
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
                  children: e.jsx(ce, { className: 'animate-spin text-emerald-500', size: 36 })
                })
              : f.length === 0
                ? e.jsxs('div', {
                    className: 'flex flex-col items-center justify-center py-16 text-center',
                    children: [
                      e.jsx(ks, { size: 44, className: 'text-slate-200 mb-4' }),
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
                        e.jsx(ue, { size: 34, className: 'mx-auto mb-3 text-slate-300' }),
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
                        var A;
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
                                    children: (A = F.estado) == null ? void 0 : A.replace('_', ' ')
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
                                      onClick: () => v(F),
                                      className:
                                        'flex-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-black flex items-center justify-center gap-1.5 hover:bg-slate-50',
                                      children: [e.jsx(Bs, { size: 14 }), ' Editar']
                                    }),
                                    e.jsxs('button', {
                                      onClick: () => g(F),
                                      className:
                                        'flex-1 px-3 py-2 rounded-lg border border-slate-200 text-rose-600 text-xs font-black flex items-center justify-center gap-1.5 hover:bg-rose-50',
                                      children: [e.jsx(me, { size: 14 }), ' Eliminar']
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
export { Yt as default };
