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
import { r as v, R as zs } from './react-vendor-6aw4XXjH.js';
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
  aK as Ts,
  b5 as $s,
  q as Re,
  b6 as Ls,
  aD as He,
  n as xa,
  aI as ws,
  Y as pe,
  aA as es,
  b7 as ma,
  b8 as ys,
  a as We,
  b9 as ss,
  aC as ua,
  ac as pa,
  ba as Ps,
  bb as Fs,
  h as ba,
  av as Ms,
  P as Ee,
  f as ha,
  bc as ga,
  p as Cs,
  aQ as Us,
  _ as Bs,
  bd as Gs,
  an as fa,
  a1 as Na,
  a3 as ja
} from './ui-vendor-CTbhg6u_.js';
import { _ as je, u as ve, C as va } from './index-BcUQjinW.js';
import { e as _a } from './exportExcel-D85v870c.js';
import { a as ls, s as is } from './storageUrl-Bn_rj096.js';
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
  e as Hs,
  g as De,
  h as Vs,
  j as Ks,
  k as ka,
  l as Ea,
  m as Aa,
  n as qs,
  D as Oa,
  o as Sa,
  p as Ra,
  q as Js,
  t as Da,
  w as ks,
  x as Ia,
  y as za,
  z as Ta,
  A as $a,
  B as La,
  G as Ws,
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
  X as Qa,
  Y as bs,
  Z as Za,
  _ as Ya,
  $ as Xa,
  a0 as Qs,
  a1 as et,
  a2 as st,
  a3 as at,
  a4 as tt,
  a5 as ot,
  a6 as rt,
  a7 as Ge,
  a8 as nt,
  a9 as Be,
  aa as Zs,
  ab as lt,
  ac as it,
  ad as ct,
  ae as dt,
  f as xt
} from './calidadService-Bhstt61n.js';
import { C as mt } from './CalidadBadge-BdOtMw8i.js';
import { f as ut } from './panelPtm-1NSDiKbX.js';
import { o as pt } from './ingresarService-BdJ6SRhY.js';
import { u as Es } from './useRealtimeTable-b3KxCJmx.js';
import './supabase-vendor-4Fjsfb0a.js';
import './animation-vendor-JfdD7EdN.js';
import './xlsx-B2eTCt_Q.js';
const As = {
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
function hs(s) {
  const d = As.codigos[s] || { codigo: 'FO-CAL-000', revision: '01' };
  return { ...As, ...d };
}
function bt(s) {
  const d = (s || '').split(',')[1] || '',
    l = atob(d),
    c = new Uint8Array(l.length);
  for (let A = 0; A < l.length; A++) c[A] = l.charCodeAt(A);
  return c;
}
const gs = [40, 82, 40, 54];
function fs(s) {
  const d = hs(s);
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
function Ns(s) {
  const d = hs(s);
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
function js(s, d) {
  const {
      Header: l,
      Footer: c,
      Paragraph: A,
      TextRun: j,
      Table: t,
      TableRow: f,
      TableCell: u,
      WidthType: C,
      AlignmentType: b,
      PageNumber: O,
      BorderStyle: x,
      ImageRun: T
    } = s,
    _ = hs(d),
    h = {
      top: { style: x.NONE },
      bottom: { style: x.NONE },
      left: { style: x.NONE },
      right: { style: x.NONE },
      insideHorizontal: { style: x.NONE },
      insideVertical: { style: x.NONE }
    },
    $ = new l({
      children: [
        new t({
          width: { size: 100, type: C.PERCENTAGE },
          borders: h,
          rows: [
            new f({
              children: [
                new u({
                  width: { size: 60, type: C.PERCENTAGE },
                  borders: h,
                  children: [
                    ...(_.logo
                      ? [
                          new A({
                            children: [
                              new T({
                                data: bt(_.logo),
                                type: 'png',
                                transformation: {
                                  width: 120,
                                  height: Math.round((120 * _.logo_h) / _.logo_w)
                                }
                              })
                            ]
                          })
                        ]
                      : []),
                    new A({ children: [new j({ text: _.empresa, bold: !0, size: 22 })] }),
                    new A({ children: [new j({ text: _.subtitulo, size: 15, color: '64748B' })] })
                  ]
                }),
                new u({
                  width: { size: 40, type: C.PERCENTAGE },
                  borders: h,
                  children: [
                    new A({
                      alignment: b.RIGHT,
                      children: [
                        new j({ text: `Código: ${_.codigo}  ·  Rev. ${_.revision}`, size: 15 })
                      ]
                    }),
                    new A({
                      alignment: b.RIGHT,
                      children: [
                        new j({
                          text: `${_.norma}  ·  Vig. ${_.fecha_revision}`,
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
    L = new c({
      children: [
        new A({
          alignment: b.CENTER,
          border: { top: { style: x.SINGLE, size: 4, color: 'CBD5E1' } },
          children: [
            new j({
              text: `${_.codigo} · Rev. ${_.revision} · ${_.norma} · Documento controlado · Página `,
              size: 14,
              color: '94A3B8'
            }),
            new j({ children: [O.CURRENT], size: 14, color: '94A3B8' }),
            new j({ text: ' de ', size: 14, color: '94A3B8' }),
            new j({ children: [O.TOTAL_PAGES], size: 14, color: '94A3B8' })
          ]
        })
      ]
    });
  return { header: $, footer: L };
}
const Ys = (s) =>
  s != null && s.storage_path
    ? ls('monitoreo-evidencias', s.storage_path)
    : Promise.resolve((s == null ? void 0 : s.imagen_url) || '');
async function ht(s) {
  const d = await fetch(s);
  if (!d.ok) throw new Error('No se pudo cargar una imagen de evidencia');
  return await d.arrayBuffer();
}
async function gt(s) {
  const d = await fetch(s);
  if (!d.ok) throw new Error('No se pudo cargar una imagen de evidencia');
  const l = await d.blob();
  return await new Promise((c, A) => {
    const j = new FileReader();
    ((j.onload = () => c(j.result)), (j.onerror = A), j.readAsDataURL(l));
  });
}
function ft(s, d) {
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
    A = {};
  return (
    (l || []).forEach((j) => {
      const t = j.item_id || 'general';
      (A[t] = A[t] || []).push(j);
    }),
    { rep: c, evByItem: A }
  );
}
async function Nt(s, d = [], l = []) {
  const c = await je(() => import('./index-BmpJy8SR.js'), []),
    {
      Document: A,
      Packer: j,
      Paragraph: t,
      TextRun: f,
      HeadingLevel: u,
      Table: C,
      TableRow: b,
      TableCell: O,
      WidthType: x,
      ImageRun: T,
      AlignmentType: _
    } = c,
    { header: h, footer: $ } = js(c, 'danos'),
    { rep: L, evByItem: M } = Xs(s, d, l),
    D = (p, N) =>
      new b({
        children: [
          new O({
            width: { size: 35, type: x.PERCENTAGE },
            children: [new t({ children: [new f({ text: p, bold: !0 })] })]
          }),
          new O({ width: { size: 65, type: x.PERCENTAGE }, children: [new t(String(N ?? '—'))] })
        ]
      }),
    y = [];
  (y.push(
    new t({ text: 'INFORME DE DAÑOS / NO CONFORMIDAD', heading: u.TITLE, alignment: _.CENTER })
  ),
    L.tipo_producto && y.push(new t({ text: L.tipo_producto, alignment: _.CENTER })),
    y.push(new t({ text: s.numero || '', alignment: _.CENTER })),
    y.push(new t('')),
    y.push(
      new C({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          D('Fecha de recepción', L.fecha_recepcion || s.fecha),
          D('Tipo de producto', L.tipo_producto),
          D('Área responsable', L.area_responsable),
          D('Clasificación', L.clasificacion),
          D('Bodega', s.bodega),
          D('Analista', s.analista_nombre)
        ]
      })
    ),
    y.push(new t('')));
  const o = (p, N) => {
    (y.push(new t({ text: p, heading: u.HEADING_2 })), N && y.push(new t(String(N))));
  };
  (L.antecedentes && o('1. ANTECEDENTES', L.antecedentes),
    L.descripcion_hallazgo && o('2. DESCRIPCIÓN DEL HALLAZGO', L.descripcion_hallazgo),
    y.push(new t({ text: '3. DAÑOS IDENTIFICADOS', heading: u.HEADING_2 })));
  let a = 0;
  for (const p of d) {
    a += 1;
    const N =
      [p.componente_afectado, p.tipo_dano].filter(Boolean).join(' — ') ||
      p.producto ||
      `Hallazgo ${a}`;
    y.push(new t({ text: `3.${a} ${N}`, heading: u.HEADING_3 }));
    const R = [];
    ((p.producto || p.codigo_producto) &&
      R.push(
        `Producto: ${p.producto || ''} ${p.codigo_producto ? `(${p.codigo_producto})` : ''}`.trim()
      ),
      Number(p.cantidad) > 0 && R.push(`Cantidad: ${Number(p.cantidad)}`),
      p.ubicacion && R.push(`Ubicación: ${p.ubicacion}`),
      p.partida && R.push(`Lote: ${p.partida}`),
      p.tipo_dano && R.push(`Tipo de daño: ${p.tipo_dano}`),
      p.componente_afectado && R.push(`Componente afectado: ${p.componente_afectado}`),
      p.consecuencia && R.push(`Consecuencia: ${p.consecuencia}`),
      p.observaciones && R.push(`Observaciones: ${p.observaciones}`),
      R.forEach((W) => y.push(new t({ children: [new f(W)] }))));
    const Y = M[p.id] || [];
    for (const W of Y)
      try {
        const F = await ht(await Ys(W));
        (y.push(
          new t({
            children: [new T({ data: F, type: 'jpg', transformation: { width: 320, height: 240 } })]
          })
        ),
          W.descripcion &&
            y.push(new t({ children: [new f({ text: W.descripcion, italics: !0, size: 18 })] })));
      } catch {}
    y.push(new t(''));
  }
  (Array.isArray(L.cuadro_resumen) &&
    L.cuadro_resumen.length &&
    (y.push(new t({ text: '4. CUADRO RESUMEN DE HALLAZGOS', heading: u.HEADING_2 })),
    y.push(
      new C({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          new b({
            children: [
              new O({ children: [new t({ children: [new f({ text: 'Indicador', bold: !0 })] })] }),
              new O({ children: [new t({ children: [new f({ text: 'Valor', bold: !0 })] })] })
            ]
          }),
          ...L.cuadro_resumen.map(
            (p) =>
              new b({
                children: [
                  new O({ children: [new t(String(p.indicador ?? ''))] }),
                  new O({ children: [new t(String(p.valor ?? ''))] })
                ]
              })
          )
        ]
      })
    ),
    y.push(new t(''))),
    L.analisis_causa && o('5. ANÁLISIS Y CAUSA PROBABLE', L.analisis_causa),
    Array.isArray(L.acciones_recomendadas) &&
      L.acciones_recomendadas.length &&
      (y.push(new t({ text: '6. ACCIONES RECOMENDADAS', heading: u.HEADING_2 })),
      L.acciones_recomendadas
        .filter(Boolean)
        .forEach((p) => y.push(new t({ text: p, bullet: { level: 0 } }))),
      y.push(new t(''))),
    y.push(new t('')),
    y.push(
      new C({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          new b({
            children: [
              new O({
                children: [
                  new t('_______________________________'),
                  new t({
                    children: [
                      new f({
                        text: L.elaborado_por || s.analista_nombre || 'Nombre / Firma',
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
                    children: [new f({ text: L.revisado_por || 'Nombre / Firma', bold: !0 })]
                  }),
                  new t('Revisado por — Jefatura / Supervisión')
                ]
              })
            ]
          })
        ]
      })
    ));
  const m = new A({
      sections: [{ headers: { default: h }, footers: { default: $ }, children: y }]
    }),
    n = await j.toBlob(m);
  ft(n, `${s.numero || 'Informe_Danos'}.docx`);
}
async function jt(s, d = [], l = []) {
  var _;
  const c = await je(
      () => import('./pdfmake-pNuCVKVo.js').then((h) => h.p),
      __vite__mapDeps([0, 1])
    ),
    A = await je(() => import('./vfs_fonts-CfcbzCvn.js').then((h) => h.v), __vite__mapDeps([2, 1])),
    j = c.default || c,
    t = A.default || A;
  j.vfs = ((_ = t.pdfMake) == null ? void 0 : _.vfs) || t.vfs || j.vfs;
  const { rep: f, evByItem: u } = Xs(s, d, l),
    C = [];
  (C.push({ text: 'INFORME DE DAÑOS / NO CONFORMIDAD', style: 'title' }),
    f.tipo_producto && C.push({ text: f.tipo_producto, alignment: 'center', margin: [0, 0, 0, 2] }),
    C.push({ text: s.numero || '', alignment: 'center', margin: [0, 0, 0, 10], color: '#64748b' }));
  const b = (h, $) => [{ text: h, bold: !0 }, { text: String($ ?? '—') }];
  C.push({
    table: {
      widths: ['35%', '65%'],
      body: [
        b('Fecha de recepción', f.fecha_recepcion || s.fecha),
        b('Tipo de producto', f.tipo_producto),
        b('Área responsable', f.area_responsable),
        b('Clasificación', f.clasificacion),
        b('Bodega', s.bodega),
        b('Analista', s.analista_nombre)
      ]
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 12]
  });
  const O = (h, $) => {
    (C.push({ text: h, style: 'h2' }), $ && C.push({ text: String($), margin: [0, 0, 0, 8] }));
  };
  (f.antecedentes && O('1. ANTECEDENTES', f.antecedentes),
    f.descripcion_hallazgo && O('2. DESCRIPCIÓN DEL HALLAZGO', f.descripcion_hallazgo),
    C.push({ text: '3. DAÑOS IDENTIFICADOS', style: 'h2' }));
  let x = 0;
  for (const h of d) {
    x += 1;
    const $ =
      [h.componente_afectado, h.tipo_dano].filter(Boolean).join(' — ') ||
      h.producto ||
      `Hallazgo ${x}`;
    C.push({ text: `3.${x} ${$}`, style: 'h3' });
    const L = [];
    ((h.producto || h.codigo_producto) &&
      L.push(
        `Producto: ${h.producto || ''} ${h.codigo_producto ? `(${h.codigo_producto})` : ''}`.trim()
      ),
      Number(h.cantidad) > 0 && L.push(`Cantidad: ${Number(h.cantidad)}`),
      h.ubicacion && L.push(`Ubicación: ${h.ubicacion}`),
      h.partida && L.push(`Lote: ${h.partida}`),
      h.tipo_dano && L.push(`Tipo de daño: ${h.tipo_dano}`),
      h.componente_afectado && L.push(`Componente afectado: ${h.componente_afectado}`),
      h.consecuencia && L.push(`Consecuencia: ${h.consecuencia}`),
      h.observaciones && L.push(`Observaciones: ${h.observaciones}`),
      L.length && C.push({ ul: L, margin: [0, 0, 0, 6] }));
    const M = u[h.id] || [],
      D = [];
    for (const y of M)
      try {
        const o = await gt(await Ys(y));
        D.push({ image: o, width: 220, margin: [0, 4, 8, 4] });
      } catch {}
    D.length && C.push({ columns: D, columnGap: 8, margin: [0, 0, 0, 8] });
  }
  (Array.isArray(f.cuadro_resumen) &&
    f.cuadro_resumen.length &&
    (C.push({ text: '4. CUADRO RESUMEN DE HALLAZGOS', style: 'h2' }),
    C.push({
      table: {
        widths: ['70%', '30%'],
        body: [
          [
            { text: 'Indicador', bold: !0 },
            { text: 'Valor', bold: !0 }
          ],
          ...f.cuadro_resumen.map((h) => [String(h.indicador ?? ''), String(h.valor ?? '')])
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    })),
    f.analisis_causa && O('5. ANÁLISIS Y CAUSA PROBABLE', f.analisis_causa),
    Array.isArray(f.acciones_recomendadas) &&
      f.acciones_recomendadas.length &&
      (C.push({ text: '6. ACCIONES RECOMENDADAS', style: 'h2' }),
      C.push({ ul: f.acciones_recomendadas.filter(Boolean), margin: [0, 0, 0, 12] })),
    C.push({
      columns: [
        {
          stack: [
            { text: '_______________________________', margin: [0, 20, 0, 0] },
            { text: f.elaborado_por || s.analista_nombre || 'Nombre / Firma', bold: !0 },
            { text: 'Elaborado por — Control de Operaciones', fontSize: 9, color: '#64748b' }
          ]
        },
        {
          stack: [
            { text: '_______________________________', margin: [0, 20, 0, 0] },
            { text: f.revisado_por || 'Nombre / Firma', bold: !0 },
            { text: 'Revisado por — Jefatura / Supervisión', fontSize: 9, color: '#64748b' }
          ]
        }
      ],
      columnGap: 24
    }));
  const T = {
    pageMargins: gs,
    header: fs('danos'),
    footer: Ns('danos'),
    content: C,
    defaultStyle: { fontSize: 10 },
    styles: {
      title: { fontSize: 16, bold: !0, alignment: 'center', margin: [0, 0, 0, 2] },
      h2: { fontSize: 12, bold: !0, margin: [0, 10, 0, 4] },
      h3: { fontSize: 11, bold: !0, margin: [0, 6, 0, 2] }
    }
  };
  j.createPdf(T).download(`${s.numero || 'Informe_Danos'}.pdf`);
}
function vt(s, d) {
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
      .map((c) => ({ d: c, n: d((A) => A.dictamen === c) }))
      .filter((c) => c.n > 0),
    porCondicion: l.map((c) => ({ x: c, n: d((A) => A.condicion_observada === c) }))
  };
}
async function _t(s, d = []) {
  const l = await je(() => import('./index-BmpJy8SR.js'), []),
    {
      Document: c,
      Packer: A,
      Paragraph: j,
      TextRun: t,
      HeadingLevel: f,
      Table: u,
      TableRow: C,
      TableCell: b,
      WidthType: O,
      AlignmentType: x
    } = l,
    { header: T, footer: _ } = js(l, 'monitoreo'),
    h = ea(d),
    $ = (a, m) =>
      new C({
        children: [
          new b({
            width: { size: 35, type: O.PERCENTAGE },
            children: [new j({ children: [new t({ text: a, bold: !0 })] })]
          }),
          new b({ width: { size: 65, type: O.PERCENTAGE }, children: [new j(String(m ?? '—'))] })
        ]
      }),
    L = (a) => new b({ children: [new j({ children: [new t({ text: a, bold: !0, size: 18 })] })] }),
    M = (a) =>
      new b({ children: [new j({ children: [new t({ text: String(a ?? '—'), size: 18 })] })] }),
    D = [];
  (D.push(new j({ text: 'INFORME DE MONITOREO A CALIDAD', heading: f.TITLE, alignment: x.CENTER })),
    D.push(new j({ text: s.numero || '', alignment: x.CENTER })),
    D.push(new j('')),
    D.push(
      new u({
        width: { size: 100, type: O.PERCENTAGE },
        rows: [
          $('Fecha', s.fecha),
          $('Bodega', s.bodega),
          $('Analista', s.analista_nombre),
          $('Periodicidad', s.periodicidad),
          $('Estado', (s.estado || '').replace('_', ' '))
        ]
      })
    ),
    D.push(new j('')),
    D.push(new j({ text: '1. RESUMEN EJECUTIVO', heading: f.HEADING_2 })),
    D.push(
      new u({
        width: { size: 100, type: O.PERCENTAGE },
        rows: [
          $('Total de ítems', h.total),
          $('Dictaminados', h.dictaminados),
          $('Pendientes', h.pendientes),
          $('Con problema (condición ≠ OK)', h.problema),
          $('No registrados en sistema', h.noReg),
          $('Semáforo vencimiento (🔴/🟠/🟢)', `${h.rojo} / ${h.naranja} / ${h.verde}`),
          ...h.porDictamen.map((a) => $(`Dictamen · ${Ve[a.d] || a.d}`, a.n))
        ]
      })
    ),
    D.push(new j('')),
    D.push(new j({ text: '2. DETALLE DE ÍTEMS', heading: f.HEADING_2 })),
    D.push(
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
            ].map(L)
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
    D.push(new j('')),
    D.push(new j('')),
    D.push(
      new u({
        width: { size: 100, type: O.PERCENTAGE },
        rows: [
          new C({
            children: [
              new b({
                children: [
                  new j('_______________________________'),
                  new j({
                    children: [new t({ text: s.analista_nombre || 'Nombre / Firma', bold: !0 })]
                  }),
                  new j('Analista — Monitoreo')
                ]
              }),
              new b({
                children: [
                  new j('_______________________________'),
                  new j({ children: [new t({ text: 'Nombre / Firma', bold: !0 })] }),
                  new j('Calidad — Dictamen')
                ]
              })
            ]
          })
        ]
      })
    ));
  const y = new c({
      sections: [{ headers: { default: T }, footers: { default: _ }, children: D }]
    }),
    o = await A.toBlob(y);
  vt(o, `${s.numero || 'Informe_Monitoreo'}.docx`);
}
async function wt(s, d = []) {
  var C;
  const l = await je(
      () => import('./pdfmake-pNuCVKVo.js').then((b) => b.p),
      __vite__mapDeps([0, 1])
    ),
    c = await je(() => import('./vfs_fonts-CfcbzCvn.js').then((b) => b.v), __vite__mapDeps([2, 1])),
    A = l.default || l,
    j = c.default || c;
  A.vfs = ((C = j.pdfMake) == null ? void 0 : C.vfs) || j.vfs || A.vfs;
  const t = ea(d),
    f = (b, O) => [{ text: b, bold: !0 }, { text: String(O ?? '—') }],
    u = [];
  (u.push({ text: 'INFORME DE MONITOREO A CALIDAD', style: 'title' }),
    u.push({ text: s.numero || '', alignment: 'center', margin: [0, 0, 0, 10], color: '#64748b' }),
    u.push({
      table: {
        widths: ['35%', '65%'],
        body: [
          f('Fecha', s.fecha),
          f('Bodega', s.bodega),
          f('Analista', s.analista_nombre),
          f('Periodicidad', s.periodicidad),
          f('Estado', (s.estado || '').replace('_', ' '))
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
          f('Total de ítems', t.total),
          f('Dictaminados', t.dictaminados),
          f('Pendientes', t.pendientes),
          f('Con problema (condición ≠ OK)', t.problema),
          f('No registrados en sistema', t.noReg),
          f('Semáforo vencimiento (R/N/V)', `${t.rojo} / ${t.naranja} / ${t.verde}`),
          ...t.porDictamen.map((b) => f(`Dictamen · ${Ve[b.d] || b.d}`, b.n))
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
            (b) => ({ text: b, bold: !0, fontSize: 8 })
          ),
          ...d.map((b) => [
            { text: b.codigo_producto || '', fontSize: 8 },
            { text: b.producto || '', fontSize: 8 },
            { text: b.partida || '', fontSize: 8 },
            { text: b.ubicacion || '', fontSize: 8 },
            { text: String(b.cantidad ?? ''), fontSize: 8 },
            { text: String(b.cantidad_afectada || 0), fontSize: 8 },
            {
              text: (b.no_registrado ? 'NO REG · ' : '') + (b.condicion_observada || ''),
              fontSize: 8
            },
            { text: b.dictamen ? Ve[b.dictamen] || b.dictamen : 'Pendiente', fontSize: 8 }
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
    A.createPdf({
      pageMargins: gs,
      header: fs('monitoreo'),
      footer: Ns('monitoreo'),
      content: u,
      defaultStyle: { fontSize: 10 },
      styles: {
        title: { fontSize: 16, bold: !0, alignment: 'center', margin: [0, 0, 0, 2] },
        h2: { fontSize: 12, bold: !0, margin: [0, 10, 0, 4] }
      }
    }).download(`${s.numero || 'Informe_Monitoreo'}.pdf`));
}
async function vs(s) {
  try {
    const d = await createImageBitmap(s),
      l = 1600;
    let { width: c, height: A } = d;
    if (c > l || A > l) {
      const u = Math.min(l / c, l / A);
      ((c = Math.round(c * u)), (A = Math.round(A * u)));
    }
    const j = document.createElement('canvas');
    return (
      (j.width = c),
      (j.height = A),
      j.getContext('2d').drawImage(d, 0, 0, c, A),
      (await new Promise((u) => j.toBlob(u, 'image/jpeg', 0.82))) || s
    );
  } catch {
    return s;
  }
}
const _s = ({ onCapture: s, onClose: d }) => {
    const l = v.useRef(null),
      c = v.useRef(null),
      [A, j] = v.useState('environment'),
      [t, f] = v.useState(null),
      [u, C] = v.useState(null),
      [b, O] = v.useState(null),
      [x, T] = v.useState(!0),
      _ = v.useCallback(() => {
        var o;
        try {
          (o = c.current) == null || o.getTracks().forEach((a) => a.stop());
        } catch {}
        c.current = null;
      }, []),
      h = v.useCallback(
        async (o) => {
          var a;
          (_(), T(!0), O(null));
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
            T(!1);
          }
        },
        [_]
      );
    v.useEffect(() => (h(A), _), []);
    const $ = () => {
        const o = A === 'environment' ? 'user' : 'environment';
        (j(o), h(o));
      },
      L = () => {
        const o = l.current;
        if (!o || !o.videoWidth) return S.error('La cámara aún no está lista');
        const a = document.createElement('canvas');
        ((a.width = o.videoWidth),
          (a.height = o.videoHeight),
          a.getContext('2d').drawImage(o, 0, 0, a.width, a.height),
          a.toBlob(
            (m) => {
              if (!m) return S.error('No se pudo capturar la foto');
              (C(m), f(URL.createObjectURL(m)), _());
            },
            'image/jpeg',
            0.9
          ));
      },
      M = () => {
        (t && URL.revokeObjectURL(t), f(null), C(null), h(A));
      },
      D = () => {
        if (!u) return;
        const o = new File([u], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
        (t && URL.revokeObjectURL(t), s == null || s(o), d == null || d());
      },
      y = () => {
        (_(), t && URL.revokeObjectURL(t), d == null || d());
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
              onClick: y,
              className: 'p-2 -m-2',
              'aria-label': 'Cerrar',
              children: e.jsx(Ie, { size: 26 })
            }),
            e.jsx('span', { className: 'text-sm font-black tracking-wide', children: 'CÁMARA' }),
            e.jsx('button', {
              onClick: $,
              className: 'p-2 -m-2 disabled:opacity-30',
              disabled: !!t || !!b,
              'aria-label': 'Cambiar cámara',
              children: e.jsx(Ne, { size: 22 })
            })
          ]
        }),
        e.jsxs('div', {
          className: 'flex-1 relative overflow-hidden flex items-center justify-center bg-black',
          children: [
            b
              ? e.jsx('div', {
                  className: 'text-white/80 text-center px-8 text-sm leading-relaxed',
                  children: b
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
              !b &&
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
                    onClick: D,
                    className:
                      'w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg active:scale-95',
                    'aria-label': 'Usar foto',
                    children: e.jsx(ze, { size: 32 })
                  })
                ]
              })
            : e.jsx('button', {
                onClick: L,
                disabled: x || !!b,
                className:
                  'w-[76px] h-[76px] rounded-full border-[5px] border-white flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform',
                'aria-label': 'Tomar foto',
                children: e.jsx('span', { className: 'w-14 h-14 rounded-full bg-white' })
              })
        })
      ]
    });
  },
  yt = ({
    informeId: s,
    itemId: d,
    evidencias: l = [],
    onChanged: c,
    canManage: A = !0,
    compact: j = !1
  }) => {
    const { user: t } = ve(),
      f = v.useRef(null),
      [u, C] = v.useState(!1),
      [b, O] = v.useState(!1),
      x = va.isNativePlatform() || (typeof navigator < 'u' && navigator.maxTouchPoints > 0),
      [T, _] = v.useState(null),
      [h, $] = v.useState({});
    v.useEffect(() => {
      let o = !0;
      return (
        is(
          Le,
          l.map((a) => a.storage_path)
        ).then((a) => {
          o && $(a);
        }),
        () => {
          o = !1;
        }
      );
    }, [l]);
    const L = A && !!s && !!d,
      M = async (o) => {
        var m;
        const a = Array.from(o.target.files || []);
        if (((o.target.value = ''), !(!a.length || !s))) {
          O(!0);
          try {
            for (const n of a) {
              if (!n.type.startsWith('image/')) continue;
              const p = await vs(n);
              await ya({ informeId: s, itemId: d, blob: p, user: t });
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
      D = async (o) => {
        if (confirm('¿Eliminar esta foto?'))
          try {
            (await wa(o), S.success('Foto eliminada'), c == null || c());
          } catch {
            S.error('No se pudo eliminar la foto');
          }
      },
      y = j ? 'w-16 h-16' : 'w-20 h-20';
    return e.jsxs('div', {
      children: [
        e.jsxs('div', {
          className: 'flex items-center gap-2 flex-wrap',
          children: [
            l.map((o) =>
              e.jsxs(
                'div',
                {
                  className: `relative group ${y} rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0`,
                  children: [
                    e.jsx('img', {
                      src: h[o.storage_path] || '',
                      alt: o.descripcion || '',
                      className: 'w-full h-full object-cover cursor-zoom-in',
                      onClick: () => h[o.storage_path] && _(h[o.storage_path])
                    }),
                    A &&
                      e.jsx('button', {
                        onClick: () => D(o),
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
            A &&
              x &&
              e.jsxs('button', {
                type: 'button',
                onClick: () => C(!0),
                disabled: !L || b,
                title: d ? 'Tomar foto con la cámara' : 'Guarda el borrador para adjuntar fotos',
                className: `${y} shrink-0 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-500 flex flex-col items-center justify-center gap-1 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed`,
                children: [
                  b ? e.jsx(Ne, { size: 18, className: 'animate-spin' }) : e.jsx(Te, { size: 18 }),
                  e.jsx('span', {
                    className: 'text-[8px] font-black uppercase tracking-wider',
                    children: 'Cámara'
                  })
                ]
              }),
            A &&
              e.jsxs('button', {
                type: 'button',
                onClick: () => {
                  var o;
                  return (o = f.current) == null ? void 0 : o.click();
                },
                disabled: !L || b,
                title: d
                  ? 'Subir foto desde archivos/galería'
                  : 'Guarda el borrador para adjuntar fotos',
                className: `${y} shrink-0 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-1 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed`,
                children: [
                  b ? e.jsx(Ne, { size: 18, className: 'animate-spin' }) : e.jsx(rs, { size: 18 }),
                  e.jsx('span', {
                    className: 'text-[8px] font-black uppercase tracking-wider',
                    children: x ? 'Galería' : 'Foto'
                  })
                ]
              }),
            l.length === 0 &&
              !A &&
              e.jsxs('span', {
                className: 'text-xs text-slate-400 flex items-center gap-1',
                children: [e.jsx(da, { size: 14 }), ' Sin fotos']
              })
          ]
        }),
        A &&
          !d &&
          e.jsx('p', {
            className: 'text-[10px] text-amber-600 mt-1',
            children: 'Guarda el borrador para poder adjuntar fotos a este hallazgo.'
          }),
        e.jsx('input', {
          ref: f,
          type: 'file',
          accept: 'image/*',
          multiple: !0,
          onChange: M,
          className: 'hidden'
        }),
        u &&
          e.jsx(_s, {
            onCapture: (o) => M({ target: { files: [o], value: '' } }),
            onClose: () => C(!1)
          }),
        T &&
          e.jsxs('div', {
            className: 'fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4',
            onClick: () => _(null),
            children: [
              e.jsx('button', {
                className: 'absolute top-4 right-4 text-white/80 hover:text-white p-2',
                children: e.jsx(Ie, { size: 28 })
              }),
              e.jsx('img', {
                src: T,
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
function Ct(s, d) {
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
  kt = { IMPORTACION: 'Importación', NACIONAL: 'Nacional' };
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
        ['Origen', kt[s.origen] || s.origen],
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
  var W, F, Q, Z, te, ne, ee;
  const c = await je(() => import('./index-BmpJy8SR.js'), []),
    {
      Document: A,
      Packer: j,
      Paragraph: t,
      TextRun: f,
      HeadingLevel: u,
      Table: C,
      TableRow: b,
      TableCell: O,
      WidthType: x,
      AlignmentType: T,
      ShadingType: _,
      BorderStyle: h
    } = c,
    { header: $, footer: L } = js(c, as(s, l)),
    M = Pe(s, l),
    D = s.resultado === 'CONFORME',
    y = {
      top: { style: h.NONE },
      bottom: { style: h.NONE },
      left: { style: h.NONE },
      right: { style: h.NONE },
      insideHorizontal: { style: h.NONE },
      insideVertical: { style: h.NONE }
    },
    o = (P, g) =>
      new b({
        children: [
          new O({
            width: { size: 35, type: x.PERCENTAGE },
            children: [new t({ children: [new f({ text: P, bold: !0 })] })]
          }),
          new O({ width: { size: 65, type: x.PERCENTAGE }, children: [new t(String(g ?? '—'))] })
        ]
      }),
    a = (P) => new O({ children: [new t({ children: [new f({ text: P, bold: !0, size: 18 })] })] }),
    m = (P) =>
      new O({ children: [new t({ children: [new f({ text: String(P ?? '—'), size: 18 })] })] }),
    n = [];
  (n.push(new t({ text: aa(s, l), heading: u.TITLE, alignment: T.CENTER })),
    l.soloNoSanitario &&
      n.push(
        new t({
          alignment: T.CENTER,
          children: [
            new f({
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
          new b({
            children: [
              new O({
                shading: { fill: D ? 'ECFDF5' : 'FEF2F2', type: _.CLEAR, color: 'auto' },
                children: [
                  new t({
                    children: [
                      new f({
                        text: D
                          ? M
                            ? 'CERTIFICADO DE CONFORMIDAD DE SALIDA — CONFORME'
                            : 'CERTIFICADO DE CONFORMIDAD — CONFORME'
                          : M
                            ? 'SALIDA NO CONFORME — NO DESPACHAR'
                            : 'RECEPCIÓN NO CONFORME',
                        bold: !0,
                        color: D ? '047857' : 'BE123C'
                      })
                    ]
                  }),
                  new t({
                    children: [new f({ text: `Folio: ${s.folio || '—'}`, bold: !0, size: 26 })]
                  }),
                  new t({
                    children: [
                      new f({
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
          ...ta(s, l).map(([P, g]) => o(P, g)),
          o(
            'Resultado',
            D ? 'CONFORME' : s.resultado === 'NO_CONFORME' ? 'NO CONFORME' : s.estado || '—'
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
  const p = M && Array.isArray((W = s.contexto) == null ? void 0 : W.skus) ? s.contexto.skus : [];
  p.length &&
    (n.push(new t({ text: 'SKUs del despacho', heading: u.HEADING_2 })),
    n.push(
      new C({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          new b({ children: ['Código', 'Producto', 'Ubicación', 'Cantidad'].map(a) }),
          ...p.map(
            (P) =>
              new b({
                children: [
                  m(P.codigo_producto),
                  m(P.producto),
                  m(P.ubicacion),
                  m(`${P.cantidad ?? '—'} ${P.unidad_medida || ''}`.trim())
                ]
              })
          )
        ]
      })
    ),
    n.push(new t('')));
  const N = s.checklist || {};
  if (
    (d.forEach((P) => {
      (n.push(new t({ text: P.titulo, heading: u.HEADING_2 })),
        n.push(
          new C({
            width: { size: 100, type: x.PERCENTAGE },
            rows: [
              new b({ children: ['Requisito', 'Resultado', 'Evidencia', 'Observación'].map(a) }),
              ...P.params.map((g) => {
                var V, q, w;
                return new b({
                  children: [
                    m(g.label),
                    m(sa[(V = N[g.id]) == null ? void 0 : V.estado] || '—'),
                    m(((q = N[g.id]) == null ? void 0 : q.evidencia) || '—'),
                    m(((w = N[g.id]) == null ? void 0 : w.nota) || '')
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
    const P = Oe(s);
    (Array.isArray(P.clasificacion) &&
      P.clasificacion.length &&
      (n.push(new t({ text: 'Clasificación del producto', heading: u.HEADING_2 })),
      cs.forEach((q) => {
        n.push(new t(`${P.clasificacion.includes(q.id) ? '☑' : '☐'} ${q.label}`));
      }),
      n.push(new t(''))),
      P.embalaje &&
        Object.values(P.embalaje).some(Boolean) &&
        (n.push(new t({ text: 'Evaluación del embalaje', heading: u.HEADING_2 })),
        n.push(
          new C({
            width: { size: 100, type: x.PERCENTAGE },
            rows: ds.map((q) => o(q.label, P.embalaje[q.id] || '—'))
          })
        ),
        n.push(new t(''))));
    const g = xs(s.checklist);
    (n.push(
      new C({
        width: { size: 100, type: x.PERCENTAGE },
        rows: [
          ...(P.disposicionInmediata ? [o('Disposición inmediata', P.disposicionInmediata)] : []),
          o('Riesgo de la recepción', `${g.emoji} ${g.label}`)
        ]
      })
    ),
      n.push(new t('')));
    const V = ms(s);
    (n.push(new t({ text: 'Indicadores ISO', heading: u.HEADING_2 })),
      n.push(
        new C({
          width: { size: 100, type: x.PERCENTAGE },
          rows: [
            o('Tiempo recepción', V.minutos != null ? `${V.minutos} minutos` : '—'),
            o('Inspector', V.inspector || '—'),
            o('N° ítems', V.items),
            o('Conformes', V.ok),
            o('No conformes', V.no),
            o('Resultado', V.pct != null ? `${String(V.pct).replace('.', ',')}%` : '—')
          ]
        })
      ),
      n.push(new t('')));
  }
  if (M) {
    const P = Oe(s),
      g = us(
        (F = P.pesos) == null ? void 0 : F.esperado,
        (Q = P.pesos) == null ? void 0 : Q.registrado
      );
    (((Z = P.pesos) != null && Z.esperado) || ((te = P.pesos) != null && te.registrado)) &&
      (n.push(new t({ text: 'Control de peso', heading: u.HEADING_2 })),
      n.push(
        new C({
          width: { size: 100, type: x.PERCENTAGE },
          rows: [
            o(
              'Peso esperado',
              (ne = P.pesos) != null && ne.esperado ? `${P.pesos.esperado} kg` : '—'
            ),
            o(
              'Peso registrado',
              (ee = P.pesos) != null && ee.registrado ? `${P.pesos.registrado} kg` : '—'
            ),
            o('Resultado', g || '—')
          ]
        })
      ),
      n.push(new t('')));
    const V = Number(P.bultosTotal ?? s.bultos) || 0;
    if (V > 0) {
      const q = Array.isArray(P.bultosEtiquetas) ? P.bultosEtiquetas : [];
      (n.push(new t({ text: 'Verificación de bultos', heading: u.HEADING_2 })),
        n.push(
          new C({
            width: { size: 100, type: x.PERCENTAGE },
            rows: [
              new b({ children: ['Bulto', 'Etiqueta'].map(a) }),
              ...Array.from(
                { length: Math.min(V, 60) },
                (w, U) =>
                  new b({
                    children: [m(`Bulto ${U + 1}/${V}`), m(q[U] ? 'Etiqueta OK' : 'Pendiente')]
                  })
              )
            ]
          })
        ),
        n.push(new t('')));
    }
    (Array.isArray(P.riesgos) &&
      P.riesgos.length &&
      (n.push(new t({ text: 'Riesgos evaluados', heading: u.HEADING_2 })),
      ps.forEach((q) => {
        n.push(new t(`${P.riesgos.includes(q.id) ? '☑' : '☐'} ${q.label}`));
      }),
      n.push(new t(''))),
      Array.isArray(P.evidencias) &&
        P.evidencias.length &&
        (n.push(new t({ text: 'Evidencia fotográfica', heading: u.HEADING_2 })),
        ['PALLET', 'EMBALAJE', 'CAMION'].forEach((q) => {
          const w = P.evidencias.filter((U) => U.tipo === q).length;
          w && n.push(new t(`📷 ${Ke[q]}: ${w} foto(s) asociada(s) al certificado.`));
        }),
        n.push(
          new t({
            children: [
              new f({
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
    const P = Oe(s);
    Array.isArray(P.evidencias) &&
      P.evidencias.length &&
      (n.push(new t({ text: 'Evidencia fotográfica', heading: u.HEADING_2 })),
      [...new Set(P.evidencias.map((g) => g.tipo))].forEach((g) => {
        const V = P.evidencias.filter((q) => q.tipo === g).length;
        V && n.push(new t(`📷 ${Ke[g] || g}: ${V} foto(s) asociada(s) al checklist.`));
      }),
      n.push(
        new t({
          children: [
            new f({
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
        borders: y,
        rows: [
          new b({
            children: [
              new O({
                borders: y,
                children: [
                  new t('_______________________________'),
                  new t({
                    children: [new f({ text: s.realizado_nombre || 'Nombre / Firma', bold: !0 })]
                  }),
                  new t(M ? 'Calidad — Certificación de salida' : 'Calidad — Inspección de ingreso')
                ]
              }),
              new O({
                borders: y,
                children: [
                  new t('_______________________________'),
                  new t({ children: [new f({ text: 'Nombre / Firma', bold: !0 })] }),
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
      n.push(new t({ children: [new f({ text: 'FIRMA ELECTRÓNICA', bold: !0 })] })),
      n.push(
        new t({
          children: [
            new f({
              text: `Algoritmo: ${s.firma_algoritmo || 'HMAC-SHA256'} · Firmado por: ${s.firmado_nombre || '—'} · ${s.firmado_en ? new Date(s.firmado_en).toLocaleString('es-CL') : ''}`,
              size: 16,
              color: '475569'
            })
          ]
        })
      ),
      n.push(new t({ children: [new f({ text: s.firma_digital, size: 12, color: '94A3B8' })] })),
      n.push(
        new t({
          children: [
            new f({
              text: `Verificar en: ${window.location.origin}/verificar?folio=${s.folio || ''}`,
              size: 14,
              color: '475569'
            })
          ]
        })
      )));
  const R = new A({
      sections: [{ headers: { default: $ }, footers: { default: L }, children: n }]
    }),
    Y = await j.toBlob(R);
  Ct(Y, oa(s, 'docx'));
}
async function na(s, d = [], l = {}) {
  var _, h, $, L, M, D, y, o;
  const c = await je(
      () => import('./pdfmake-pNuCVKVo.js').then((a) => a.p),
      __vite__mapDeps([0, 1])
    ),
    A = await je(() => import('./vfs_fonts-CfcbzCvn.js').then((a) => a.v), __vite__mapDeps([2, 1])),
    j = c.default || c,
    t = A.default || A;
  j.vfs = ((_ = t.pdfMake) == null ? void 0 : _.vfs) || t.vfs || j.vfs;
  const f = s.checklist || {},
    u = Pe(s, l),
    C = s.resultado === 'CONFORME',
    b = s.completado_en ? new Date(s.completado_en).toLocaleString('es-CL') : '—',
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
                  text: `${s.realizado_nombre || ''}${s.completado_en ? ' · ' + b : ''}`,
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
          O('Fecha de finalización', b)
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    }));
  const T = u && Array.isArray((h = s.contexto) == null ? void 0 : h.skus) ? s.contexto.skus : [];
  if (
    (T.length &&
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
            ...T.map((a) => [
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
                var p, N, R;
                const n = (p = f[m.id]) == null ? void 0 : p.estado;
                return [
                  { text: m.label, fontSize: 9 },
                  {
                    text: sa[n] || '—',
                    fontSize: 9,
                    bold: !0,
                    color: n === 'NO' ? '#be123c' : n === 'OK' ? '#047857' : '#64748b'
                  },
                  {
                    text: ((N = f[m.id]) == null ? void 0 : N.evidencia) || '—',
                    fontSize: 9,
                    color: '#475569'
                  },
                  { text: ((R = f[m.id]) == null ? void 0 : R.nota) || '', fontSize: 9 }
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
        columns: [0, 1].map((p) => ({
          stack: cs
            .filter((N, R) => R % 2 === p)
            .map((N) => ({
              text: `${a.clasificacion.includes(N.id) ? '☑' : '☐'} ${N.label}`,
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
            body: ds.map((p) => {
              const N = a.embalaje[p.id] || '—',
                R =
                  ['Malo', 'Incorrecto', 'Sí'].includes(N) ||
                  (p.id === 'pallet' && N === 'Regular');
              return [
                { text: p.label, bold: !0 },
                { text: N, bold: !0, color: N === '—' ? '#64748b' : R ? '#be123c' : '#047857' }
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
            ].map((p) => ({ text: p, bold: !0, fontSize: 8 })),
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
        ($ = a.pesos) == null ? void 0 : $.esperado,
        (L = a.pesos) == null ? void 0 : L.registrado
      );
    (((M = a.pesos) != null && M.esperado) || ((D = a.pesos) != null && D.registrado)) &&
      (x.push({ text: 'Control de peso', style: 'h2' }),
      x.push({
        table: {
          widths: ['35%', '65%'],
          body: [
            O(
              'Peso esperado',
              (y = a.pesos) != null && y.esperado ? `${a.pesos.esperado} kg` : '—'
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
      const N = Array.isArray(a.bultosEtiquetas) ? a.bultosEtiquetas : [];
      (x.push({ text: 'Verificación de bultos', style: 'h2' }),
        x.push({
          table: {
            headerRows: 1,
            widths: ['auto', '*'],
            body: [
              ['Bulto', 'Etiqueta'].map((R) => ({ text: R, bold: !0, fontSize: 9 })),
              ...Array.from({ length: Math.min(n, 60) }, (R, Y) => [
                { text: `Bulto ${Y + 1}/${n}`, fontSize: 9 },
                {
                  text: N[Y] ? 'Etiqueta OK' : 'Pendiente',
                  fontSize: 9,
                  bold: !0,
                  color: N[Y] ? '#047857' : '#b45309'
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
        columns: [0, 1].map((N) => ({
          stack: ps
            .filter((R, Y) => Y % 2 === N)
            .map((R) => ({
              text: `${a.riesgos.includes(R.id) ? '☑' : '☐'} ${R.label}`,
              fontSize: 9,
              margin: [0, 1, 0, 1]
            }))
        })),
        columnGap: 24,
        margin: [0, 0, 0, 12]
      }));
    const p = Array.isArray(l.evidenciasImg) ? l.evidenciasImg : [];
    if (p.length || (Array.isArray(a.evidencias) && a.evidencias.length))
      if ((x.push({ text: 'Evidencia fotográfica', style: 'h2' }), p.length))
        for (let N = 0; N < p.length; N += 2)
          x.push({
            columns: p.slice(N, N + 2).map((R) => ({
              width: '50%',
              stack: [
                { image: R.dataUrl, fit: [230, 160] },
                { text: Ke[R.tipo] || R.tipo, fontSize: 8, color: '#64748b', margin: [0, 2, 0, 0] }
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
            columns: m.slice(n, n + 2).map((p) => ({
              width: '50%',
              stack: [
                { image: p.dataUrl, fit: [230, 160] },
                { text: Ke[p.tipo] || p.tipo, fontSize: 8, color: '#64748b', margin: [0, 2, 0, 0] }
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
  j.createPdf({
    pageMargins: gs,
    header: fs(as(s, l)),
    footer: Ns(as(s, l)),
    content: x,
    defaultStyle: { fontSize: 10 },
    styles: {
      title: { fontSize: 16, bold: !0, alignment: 'center', margin: [0, 0, 0, 2] },
      h2: { fontSize: 12, bold: !0, margin: [0, 10, 0, 4] }
    }
  }).download(oa(s, 'pdf'));
}
const Et = (s) => ({
    nivel: `cat_${s.codigo}`,
    titulo: `Requisitos específicos — ${s.label}${s.clase_riesgo ? ` (Clase ${s.clase_riesgo})` : ''}`,
    categoria: s.codigo,
    params: s.params || []
  }),
  ts = {
    IMPORTACION: { label: 'Importación', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    NACIONAL: { label: 'Nacional', cls: 'bg-teal-100 text-teal-700 border-teal-200' }
  },
  At = ({ tarea: s, onBack: d, canManage: l, onGenerarDanos: c }) => {
    var ie, i, z, B;
    const { user: A } = ve(),
      j = Vs(),
      t = Ks(),
      { data: f, isLoading: u } = ka(s.id),
      C = s.estado === 'CONFORME' || s.estado === 'NO_CONFORME',
      b = C || !l,
      O = (r) => {
        const { _extras: E, ...G } = r || {};
        return { resp: G, extras: E || {} };
      },
      [x, T] = v.useState(() => O(s.checklist).resp),
      [_, h] = v.useState(() => O(s.checklist).extras),
      [$, L] = v.useState(s.observaciones || ''),
      [M, D] = v.useState(s.disposicion || '');
    v.useEffect(() => {
      const { resp: r, extras: E } = O(s.checklist);
      (T(r), h(E), L(s.observaciones || ''), D(s.disposicion || ''));
    }, [s.id]);
    const y = (r, E) => T((G) => ({ ...G, [r]: { ...G[r], estado: E } })),
      o = (r, E) => T((G) => ({ ...G, [r]: { ...G[r], nota: E } })),
      a = (r, E) => T((G) => ({ ...G, [r]: { ...G[r], evidencia: E } })),
      m = (r, E) => h((G) => ({ ...G, [r]: E })),
      n = (r = _) => ({ ...x, _extras: r }),
      p = (r) =>
        h((E) => {
          const G = new Set(E.clasificacion || []);
          return (G.has(r) ? G.delete(r) : G.add(r), { ...E, clasificacion: [...G] });
        }),
      N = (f == null ? void 0 : f.categorias) || [],
      R = !!(f != null && f.solo_no_sanitario),
      Y = (f == null ? void 0 : f.sin_clasificar) || 0,
      W = v.useMemo(() => {
        const r = N.filter((E) => (E.params || []).length > 0).map(Et);
        return [...Ea, ...r];
      }, [N]),
      F = v.useMemo(() => W.flatMap((r) => r.params), [W]),
      {
        answeredAll: Q,
        hasNo: Z,
        faltan: te
      } = v.useMemo(() => {
        var G;
        let r = 0,
          E = !1;
        for (const K of F) {
          const re = (G = x[K.id]) == null ? void 0 : G.estado;
          (re && r++, re === 'NO' && (E = !0));
        }
        return { answeredAll: r === F.length, hasNo: E, faltan: F.length - r };
      }, [x, F]),
      ne = async () => {
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
      ee = async (r) => {
        try {
          const E = { categorias: N, soloNoSanitario: R };
          if (r === 'pdf') {
            const G = _.evidencias || [],
              K = [];
            for (const re of G)
              try {
                const fe = await ls(Le, re.path);
                if (!fe) continue;
                const Ce = await fetch(fe).then((Ae) => (Ae.ok ? Ae.blob() : null));
                if (!Ce || !/image\/(jpeg|png)/.test(Ce.type)) continue;
                const Fe = await new Promise((Ae, ge) => {
                  const Me = new FileReader();
                  ((Me.onload = () => Ae(Me.result)), (Me.onerror = ge), Me.readAsDataURL(Ce));
                });
                K.push({ tipo: re.tipo, dataUrl: Fe });
              } catch {}
            ((E.evidenciasImg = K), await na(s, W, E));
          } else await ra(s, W, E);
        } catch (E) {
          S.error(`No se pudo generar el documento: ${E.message}`);
        }
      },
      P = async () => {
        try {
          (await j.mutateAsync({
            tareaId: s.id,
            checklist: n(),
            observaciones: $,
            disposicion: M,
            finalizar: !1
          }),
            S.success('Avance guardado'));
        } catch (r) {
          S.error(`No se pudo guardar: ${r.message}`);
        }
      },
      g = async () => {
        if (u) {
          S.error('Cargando las familias de producto de la recepción…');
          return;
        }
        if (!Q) {
          S.error(`Faltan ${te} ítem(s) por responder`);
          return;
        }
        const r = Z ? 'NO_CONFORME' : 'CONFORME';
        if (r === 'NO_CONFORME' && !M) {
          S.error('Selecciona la Disposición / Acción a tomar antes de finalizar');
          return;
        }
        if (r === 'NO_CONFORME' && !_.disposicionInmediata) {
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
            const E = await j.mutateAsync({
              tareaId: s.id,
              checklist: n(),
              observaciones: $,
              disposicion: M,
              finalizar: !0,
              resultado: r
            });
            r === 'CONFORME'
              ? (S.success(
                  `Certificado automáticamente ${(E == null ? void 0 : E.folio) || ''} — recepción CONFORME`
                ),
                d())
              : S.warning('Recepción NO CONFORME. Tarea urgente del Informe de Daños generada.');
          } catch (E) {
            S.error(`No se pudo finalizar: ${E.message}`);
          }
      },
      V = ({ pid: r, val: E, icon: G, activeCls: K }) => {
        var fe;
        const re = ((fe = x[r]) == null ? void 0 : fe.estado) === E;
        return e.jsx('button', {
          type: 'button',
          disabled: b,
          onClick: () => y(r, E),
          className: `w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shrink-0
          ${re ? K : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'} ${b ? 'opacity-60 cursor-default' : ''}`,
          children: G
        });
      },
      q = De[s.estado] || {},
      w = v.useMemo(() => xs({ ...x, _extras: _ }), [x, _]),
      U = v.useMemo(() => ms({ ...s, checklist: { ...x, _extras: _ } }), [x, _, s]),
      J =
        U.minutos ??
        (s.created_at
          ? Math.max(0, Math.round((Date.now() - new Date(s.created_at).getTime()) / 6e4))
          : null),
      oe = _.embalaje || {},
      X = zs.useRef(null),
      [de, _e] = v.useState(!1),
      be = typeof navigator < 'u' && navigator.maxTouchPoints > 0,
      [le, we] = v.useState(null),
      [he, ye] = v.useState(!1),
      [k, I] = v.useState({}),
      H = _.evidencias || [];
    v.useEffect(() => {
      let r = !0;
      return (
        is(
          Le,
          H.map((E) => E.path)
        ).then((E) => {
          r && I(E);
        }),
        () => {
          r = !1;
        }
      );
    }, [JSON.stringify(H.map((r) => r.path))]);
    const se = (r, E = 'galeria') => {
        var G;
        (we(r), E === 'camara' ? _e(!0) : (G = X.current) == null || G.click());
      },
      ae = async (r) => {
        var G;
        const E = Array.from(r.target.files || []);
        if (((r.target.value = ''), !(!E.length || !le))) {
          ye(!0);
          try {
            const K = [];
            for (const re of E) {
              if (!re.type.startsWith('image/')) continue;
              const fe = await vs(re),
                Ce = await Da({ tareaId: s.id, tipo: le, blob: fe });
              K.push({ tipo: le, path: Ce, subido_en: new Date().toISOString() });
            }
            if (K.length) {
              const re = { ..._, evidencias: [...H, ...K] };
              (h(re),
                await j.mutateAsync({
                  tareaId: s.id,
                  checklist: n(re),
                  observaciones: $,
                  disposicion: M,
                  finalizar: !1
                }),
                S.success(K.length > 1 ? 'Fotos agregadas' : 'Foto agregada'));
            }
          } catch (K) {
            S.error(
              (G = K == null ? void 0 : K.message) != null && G.includes('row-level security')
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
            await Js(r.path);
            const E = { ..._, evidencias: H.filter((G) => G.path !== r.path) };
            (h(E),
              await j.mutateAsync({
                tareaId: s.id,
                checklist: n(E),
                observaciones: $,
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
                          className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${q.cls || ''}`,
                          children: q.label || s.estado
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
                          children: [e.jsx(Ts, { size: 12 }), ' ', s.fecha_recepcion || '—']
                        }),
                        s.bultos != null &&
                          e.jsxs('span', { children: ['· ', s.bultos, ' bultos'] }),
                        ((z = s.contexto) == null ? void 0 : z.pallets) != null &&
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
                      onClick: () => ee('pdf'),
                      title: 'Descargar PDF',
                      className:
                        'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                      children: [e.jsx($s, { size: 15 }), ' PDF']
                    }),
                    e.jsxs('button', {
                      onClick: () => ee('word'),
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
                    onClick: ne,
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
            N.length === 0
              ? e.jsx('p', {
                  className: 'text-xs text-slate-400',
                  children: u
                    ? 'Detectando familias…'
                    : 'Sin ítems clasificables en la recepción. Se aplican solo los controles universales.'
                })
              : e.jsx('div', {
                  className: 'flex flex-wrap gap-2',
                  children: N.map((r) => {
                    var E;
                    return e.jsxs(
                      'span',
                      {
                        className: `text-[11px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${((E = Aa[r.codigo]) == null ? void 0 : E.cls) || 'bg-slate-100 text-slate-600 border-slate-200'}`,
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
            (f == null ? void 0 : f.requiere_registro_isp) &&
              e.jsxs('p', {
                className:
                  'mt-3 text-[11px] text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg px-3 py-2 flex items-start gap-1.5',
                children: [
                  e.jsx(ws, { size: 13, className: 'mt-0.5 shrink-0' }),
                  'Contiene insumos de posible ',
                  e.jsx('b', { children: 'control obligatorio ISP' }),
                  ' (jeringas, agujas, guantes, preservativos): verifique el ',
                  e.jsx('b', { children: 'N° de registro sanitario' }),
                  ' en la sección de insumo estéril.'
                ]
              }),
            R &&
              e.jsxs('p', {
                className:
                  'mt-3 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-start gap-1.5',
                children: [
                  e.jsx(ws, { size: 13, className: 'mt-0.5 shrink-0' }),
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
                  e.jsx(pe, { size: 13, className: 'mt-0.5 shrink-0' }),
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
                e.jsx($e, { size: 16, className: 'text-slate-400' }),
                ' Clasificación del producto'
              ]
            }),
            e.jsx('div', {
              className: 'flex flex-wrap gap-2',
              children: cs.map((r) => {
                const E = (_.clasificacion || []).includes(r.id);
                return e.jsxs(
                  'button',
                  {
                    type: 'button',
                    disabled: b,
                    onClick: () => p(r.id),
                    className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${E ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'}`,
                    children: [E ? '☑' : '☐', ' ', r.label]
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
            !b &&
              e.jsxs('div', {
                className: 'flex flex-wrap items-center gap-2 mb-3',
                children: [
                  e.jsx('span', {
                    className: 'text-[10px] font-black text-slate-400 uppercase tracking-widest',
                    children: 'Aplicar a todos:'
                  }),
                  e.jsxs('button', {
                    type: 'button',
                    onClick: () => m('embalaje', { ...oe, ...ks.conforme }),
                    className:
                      'px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-black hover:bg-emerald-100 inline-flex items-center gap-1.5',
                    children: [e.jsx(ze, { size: 13 }), ' Todo conforme']
                  }),
                  e.jsxs('button', {
                    type: 'button',
                    onClick: () => m('embalaje', { ...oe, ...ks.sinPallet }),
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
                        children: r.opciones.map((E) => {
                          const G = oe[r.id] === E,
                            K =
                              ['Malo', 'Incorrecto', 'Sí'].includes(E) ||
                              (r.id === 'pallet' && E === 'Regular'),
                            re = E === Ra;
                          return e.jsx(
                            'button',
                            {
                              type: 'button',
                              disabled: b,
                              onClick: () => m('embalaje', { ...oe, [r.id]: G ? void 0 : E }),
                              className: `px-3 py-1.5 rounded-lg border text-xs font-black transition-colors ${G ? (re ? 'bg-slate-400 border-slate-400 text-white' : K ? 'bg-rose-500 border-rose-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white') : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`,
                              children: E
                            },
                            E
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
            W.map((r) =>
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
                      children: r.params.map((E) => {
                        var G, K, re, fe, Ce, Fe, Ae;
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
                                    children: E.label
                                  }),
                                  ((G = x[E.id]) == null ? void 0 : G.estado) &&
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
                                            ((K = x[E.id]) == null ? void 0 : K.evidencia) || '',
                                          disabled: b,
                                          onChange: (ge) => a(E.id, ge.target.value),
                                          className: `px-2 py-1 rounded-lg border text-[11px] font-bold ${(re = x[E.id]) != null && re.evidencia ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 text-slate-400'}`,
                                          children: [
                                            e.jsx('option', {
                                              value: '',
                                              children: '— cómo se verificó —'
                                            }),
                                            qs.map((ge) =>
                                              e.jsx('option', { value: ge, children: ge }, ge)
                                            )
                                          ]
                                        })
                                      ]
                                    }),
                                  ((fe = x[E.id]) == null ? void 0 : fe.estado) === 'NO' &&
                                    e.jsx('input', {
                                      value: ((Ce = x[E.id]) == null ? void 0 : Ce.nota) || '',
                                      disabled: b,
                                      onChange: (ge) => o(E.id, ge.target.value),
                                      placeholder: 'Detalle de la no conformidad…',
                                      className:
                                        'mt-1.5 w-full px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/40 text-xs outline-none focus:border-rose-400'
                                    }),
                                  ((Fe = x[E.id]) == null ? void 0 : Fe.estado) === 'NA' &&
                                    e.jsx('input', {
                                      value: ((Ae = x[E.id]) == null ? void 0 : Ae.nota) || '',
                                      disabled: b,
                                      onChange: (ge) => o(E.id, ge.target.value),
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
                                  e.jsx(V, {
                                    pid: E.id,
                                    val: 'OK',
                                    icon: e.jsx(ze, { size: 16 }),
                                    activeCls: 'bg-emerald-500 border-emerald-500 text-white'
                                  }),
                                  e.jsx(V, {
                                    pid: E.id,
                                    val: 'NO',
                                    icon: e.jsx(Ie, { size: 16 }),
                                    activeCls: 'bg-rose-500 border-rose-500 text-white'
                                  }),
                                  e.jsx(V, {
                                    pid: E.id,
                                    val: 'NA',
                                    icon: e.jsx(es, { size: 16 }),
                                    activeCls: 'bg-slate-400 border-slate-400 text-white'
                                  })
                                ]
                              })
                            ]
                          },
                          E.id
                        );
                      })
                    })
                  ]
                },
                r.nivel
              )
            ),
            e.jsxs('div', {
              className: `bg-white rounded-2xl border p-5 ${Z && !_.disposicionInmediata ? 'border-rose-200' : 'border-slate-200'}`,
              children: [
                e.jsxs('label', {
                  className: `text-[10px] font-black uppercase tracking-widest ${Z && !_.disposicionInmediata ? 'text-rose-500' : 'text-slate-400'}`,
                  children: [
                    'Disposición inmediata ',
                    Z && e.jsx('span', { children: '*obligatoria (hay no conformes)' })
                  ]
                }),
                e.jsx('div', {
                  className: 'flex flex-wrap gap-2 mt-2',
                  children: Oa.map((r) => {
                    const E = _.disposicionInmediata === r,
                      G = ['Cuarentena', 'Rechazo proveedor', 'Devuelto'].includes(r);
                    return e.jsxs(
                      'button',
                      {
                        type: 'button',
                        disabled: b,
                        onClick: () => m('disposicionInmediata', E ? void 0 : r),
                        className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${E ? (G ? 'bg-rose-500 border-rose-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white') : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`,
                        children: [E ? '☑' : '☐', ' ', r]
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
                    disabled: b,
                    onChange: (r) => D(r.target.value),
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
                  value: $,
                  disabled: b,
                  onChange: (r) => L(r.target.value),
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
                    const E = H.filter((G) => G.tipo === r.id);
                    return e.jsxs(
                      'div',
                      {
                        className: 'rounded-xl border border-slate-100 p-3',
                        children: [
                          e.jsxs('p', {
                            className:
                              'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2',
                            children: ['📷 ', r.label, ' (', E.length, ')']
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2 flex-wrap',
                            children: [
                              E.map((G) =>
                                e.jsxs(
                                  'div',
                                  {
                                    className:
                                      'relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0',
                                    children: [
                                      e.jsx('a', {
                                        href: k[G.path] || '#',
                                        target: '_blank',
                                        rel: 'noreferrer',
                                        children: e.jsx('img', {
                                          src: k[G.path] || '',
                                          alt: r.label,
                                          className: 'w-full h-full object-cover'
                                        })
                                      }),
                                      !b &&
                                        e.jsx('button', {
                                          onClick: () => xe(G),
                                          title: 'Eliminar foto',
                                          className:
                                            'absolute top-0.5 right-0.5 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity',
                                          children: e.jsx(me, { size: 11 })
                                        })
                                    ]
                                  },
                                  G.path
                                )
                              ),
                              !b &&
                                be &&
                                e.jsxs('button', {
                                  type: 'button',
                                  onClick: () => se(r.id, 'camara'),
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
                              !b &&
                                e.jsxs('button', {
                                  type: 'button',
                                  onClick: () => se(r.id, 'galeria'),
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
                              E.length === 0 &&
                                b &&
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
                  ref: X,
                  type: 'file',
                  accept: 'image/*',
                  multiple: !0,
                  onChange: ae,
                  className: 'hidden'
                }),
                de &&
                  e.jsx(_s, {
                    onCapture: (r) => ae({ target: { files: [r], value: '' } }),
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
                    ['Tiempo recepción', J != null ? `${J} min` : '—'],
                    ['Inspector', U.inspector || (A == null ? void 0 : A.nombre) || '—'],
                    ['N° ítems', U.items || 0],
                    ['Conformes', U.ok || 0],
                    ['No conformes', U.no || 0],
                    ['Resultado', U.pct != null ? `${String(U.pct).replace('.', ',')}%` : '—']
                  ].map(([r, E]) =>
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
                            className: `text-lg font-black ${r === 'No conformes' && U.no > 0 ? 'text-rose-600' : 'text-slate-900'} truncate`,
                            title: String(E),
                            children: E
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
        !b &&
          e.jsxs('div', {
            className:
              'sticky bottom-3 mt-5 bg-white rounded-2xl border border-slate-200 shadow-lg p-4 flex flex-wrap items-center justify-between gap-3',
            children: [
              e.jsx('div', {
                className: 'text-xs font-black',
                children:
                  te > 0
                    ? e.jsxs('span', {
                        className: 'text-slate-500',
                        children: [te, ' ítem(s) por responder']
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
                    onClick: P,
                    disabled: j.isPending,
                    className:
                      'px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50',
                    children: 'Guardar avance'
                  }),
                  e.jsx('button', {
                    onClick: g,
                    disabled: j.isPending || te > 0,
                    className: `px-4 py-2.5 rounded-xl text-white font-black text-sm flex items-center gap-2 disabled:opacity-40 ${Z ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`,
                    children: Z
                      ? e.jsxs(e.Fragment, {
                          children: [e.jsx(ys, { size: 16 }), ' Finalizar (No Conforme)']
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
                  children: [e.jsx(ys, { size: 16 }), ' Generar Informe de Daños']
                })
            ]
          })
      ]
    });
  },
  Ot = ({ onGenerarDanos: s }) => {
    const { hasPermission: d, user: l } = ve(),
      c = d('manage_quality') || d('manage_monitoreo'),
      A = (l == null ? void 0 : l.rol) === 'ADMIN' || (l == null ? void 0 : l.es_admin_delegado),
      { data: j = [], isLoading: t, refetch: f, isFetching: u } = Ca(),
      C = Hs(),
      [b, O] = v.useState(null),
      [x, T] = v.useState(''),
      [_, h] = v.useState('TODOS'),
      $ = async (y, o) => {
        if (
          (o.stopPropagation(),
          !!confirm(
            `¿Eliminar la tarea de ${y.proveedor || 'recepción'} (OC ${y.oc || '—'})? Esta acción no se puede deshacer.`
          ))
        )
          try {
            (await C.mutateAsync(y.id), S.success('Tarea eliminada'));
          } catch (a) {
            S.error(`No se pudo eliminar: ${a.message}`);
          }
      },
      L = j.filter((y) => y.estado === 'PENDIENTE' || y.estado === 'EN_PROCESO').length,
      M = v.useMemo(() => {
        const y = x.trim().toLocaleLowerCase('es-CL');
        return j.filter(
          (o) =>
            (!y ||
              [o.oc, o.proveedor, o.folio, o.origen].some((m) =>
                String(m || '')
                  .toLocaleLowerCase('es-CL')
                  .includes(y)
              )) &&
            (_ === 'TODOS' || o.estado === _)
        );
      }, [x, _, j]),
      D = b ? j.find((y) => y.id === b.id) || b : null;
    return D
      ? e.jsx(At, { tarea: D, onBack: () => O(null), canManage: c, onGenerarDanos: s })
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
                      onClick: () => f(),
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
                    e.jsx(Ye, { label: 'Total', value: j.length, tone: 'slate' }),
                    e.jsx(Ye, { label: 'Por revisar', value: L, tone: 'amber' }),
                    e.jsx(Ye, { label: 'Finalizadas', value: j.length - L, tone: 'emerald' })
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
                          onChange: (y) => T(y.target.value),
                          placeholder: 'Buscar OC, nombre de proveedor o folio…',
                          className:
                            'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'
                        })
                      ]
                    }),
                    e.jsx('div', {
                      className: 'flex gap-1 overflow-x-auto pb-0.5',
                      children: ['TODOS', 'PENDIENTE', 'EN_PROCESO', 'CONFORME', 'NO_CONFORME'].map(
                        (y) => {
                          var o;
                          return e.jsx(
                            'button',
                            {
                              onClick: () => h(y),
                              className: `whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-black tracking-wide transition ${_ === y ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-200'}`,
                              children:
                                y === 'TODOS'
                                  ? 'Todos'
                                  : ((o = De[y]) == null ? void 0 : o.label) || y
                            },
                            y
                          );
                        }
                      )
                    })
                  ]
                }),
                !t &&
                  e.jsxs('p', {
                    className: 'mt-2 text-[11px] font-bold text-slate-400',
                    children: ['Mostrando ', M.length, ' de ', j.length, ' recepciones.']
                  })
              ]
            }),
            t
              ? e.jsx('div', {
                  className: 'flex justify-center py-20',
                  children: e.jsx(ce, { className: 'animate-spin text-emerald-500', size: 36 })
                })
              : j.length === 0
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
                            (T(''), h('TODOS'));
                          },
                          className:
                            'mt-2 text-xs font-black text-emerald-600 hover:text-emerald-700',
                          children: 'Limpiar filtros'
                        })
                      ]
                    })
                  : e.jsx('div', {
                      className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
                      children: M.map((y) => {
                        var n, p, N;
                        const o = De[y.estado] || {},
                          a = ts[y.origen] || {},
                          m = y.estado === 'PENDIENTE' || y.estado === 'EN_PROCESO';
                        return e.jsxs(
                          'div',
                          {
                            role: 'button',
                            tabIndex: 0,
                            onClick: () => O(y),
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
                                      y.proveedor || 'Sin proveedor'
                                    ]
                                  }),
                                  e.jsxs('div', {
                                    className: 'flex items-center gap-1.5 shrink-0',
                                    children: [
                                      e.jsx('span', {
                                        className: `text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${o.cls}`,
                                        children: o.label || y.estado
                                      }),
                                      A &&
                                        e.jsx('button', {
                                          onClick: (R) => $(y, R),
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
                                    children: a.label || y.origen
                                  }),
                                  y.folio &&
                                    e.jsx('span', {
                                      className:
                                        'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-600 border-emerald-200 font-mono',
                                      children: y.folio
                                    })
                                ]
                              }),
                              e.jsxs('p', {
                                className: 'text-sm text-slate-500 font-medium',
                                children: ['OC ', y.oc || '—', ' · ', y.fecha_recepcion || '—']
                              }),
                              (y.bultos != null ||
                                ((n = y.contexto) == null ? void 0 : n.pallets) != null) &&
                                e.jsxs('p', {
                                  className: 'text-xs text-slate-400 mt-1',
                                  children: [
                                    y.bultos != null ? `${y.bultos} bultos` : '',
                                    ((p = y.contexto) == null ? void 0 : p.pallets) != null
                                      ? ` · ${y.contexto.pallets} pallets`
                                      : '',
                                    (N = y.contexto) != null && N.tipo_contenedor
                                      ? ` · ${y.contexto.tipo_contenedor}`
                                      : ''
                                  ]
                                })
                            ]
                          },
                          y.id
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
  St = ({ onClose: s }) => {
    const d = La(),
      [l, c] = v.useState(''),
      [A, j] = v.useState(!1),
      [t, f] = v.useState([]),
      [u, C] = v.useState([]),
      [b, O] = v.useState(''),
      [x, T] = v.useState('NORMAL'),
      _ = v.useCallback(async () => {
        j(!0);
        try {
          f(await Ws(l, !1));
        } catch (a) {
          S.error(`Error buscando stock: ${a.message}`);
        } finally {
          j(!1);
        }
      }, [l]),
      h = (a) => `${a.codigo_producto}|${a.partida || ''}|${a.ubicacion || ''}`,
      $ = (a) => ({
        _key: h(a),
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
      L = (a) => {
        const m = h(a);
        if (u.some((n) => n._key === m)) {
          S.info('Ese SKU ya está en la asignación');
          return;
        }
        C((n) => [...n, $(a)]);
      },
      M = (a) => C((m) => m.filter((n) => n._key !== a)),
      D = (a) => {
        const m = h(a);
        u.some((n) => n._key === m) ? M(m) : L(a);
      },
      y = () => {
        if (t.every((m) => u.some((n) => n._key === h(m)))) {
          const m = new Set(t.map(h));
          C((n) => n.filter((p) => !m.has(p._key)));
          return;
        }
        C((m) => {
          const n = new Set(m.map((N) => N._key)),
            p = t.map($).filter((N) => (n.has(N._key) ? !1 : (n.add(N._key), !0)));
          return [...m, ...p];
        });
      },
      o = async () => {
        if (u.length === 0) {
          S.error('Elige al menos un SKU');
          return;
        }
        try {
          const a = u.map(({ _key: m, ...n }) => n);
          (await d.mutateAsync({ skus: a, motivo: b, prioridad: x }),
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
                        onKeyDown: (a) => a.key === 'Enter' && _(),
                        placeholder: 'Buscar por SKU, descripción o ubicación…',
                        className: 'flex-1 text-sm outline-none bg-transparent'
                      })
                    ]
                  }),
                  e.jsxs('button', {
                    onClick: _,
                    disabled: A,
                    className:
                      'px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 disabled:opacity-50',
                    children: [
                      A
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
                          checked: t.every((a) => u.some((m) => m._key === h(a))),
                          onChange: y,
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
                              checked: u.some((n) => n._key === h(a)),
                              onChange: () => D(a),
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
                        value: b,
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
                        onChange: (a) => T(a.target.value),
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
  Rt = ({ canAssign: s, canManageQuality: d, onGenerarInforme: l }) => {
    const { user: c } = ve(),
      A = (c == null ? void 0 : c.rol) === 'ADMIN' || (c == null ? void 0 : c.es_admin_delegado),
      { data: j = [], isLoading: t } = Ia(),
      f = za(),
      u = Ta(),
      [C, b] = v.useState(!1),
      O = async (_) => {
        if (confirm('¿Anular esta asignación? No se podrá revertir.'))
          try {
            (await f.mutateAsync(_.id), S.success('Asignación anulada'));
          } catch (h) {
            S.error(`No se pudo anular: ${h.message}`);
          }
      },
      x = async (_) => {
        if (confirm('¿Eliminar esta asignación definitivamente? Esta acción no se puede deshacer.'))
          try {
            (await u.mutateAsync(_.id), S.success('Asignación eliminada'));
          } catch (h) {
            S.error(`No se pudo eliminar: ${h.message}`);
          }
      },
      T = j.filter((_) => _.estado === 'PENDIENTE' || _.estado === 'EN_PROCESO').length;
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
                T > 0 &&
                  e.jsxs('span', {
                    className:
                      'text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700',
                    children: [T, ' pendiente(s)']
                  })
              ]
            }),
            s &&
              e.jsxs('button', {
                onClick: () => b(!0),
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
          : j.length === 0
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
                children: j.map((_) => {
                  const h = $a[_.estado] || {},
                    $ = Array.isArray(_.skus) ? _.skus : [],
                    L = _.estado === 'PENDIENTE' || _.estado === 'EN_PROCESO',
                    M =
                      L &&
                      _.locked_by &&
                      _.locked_at &&
                      Date.now() - new Date(_.locked_at).getTime() < 15 * 60 * 1e3,
                    D = M && _.locked_by !== (c == null ? void 0 : c.id);
                  return e.jsxs(
                    'div',
                    {
                      className: `bg-white rounded-2xl border p-4 ${L ? 'border-amber-200' : 'border-slate-200'}`,
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center justify-between gap-2 mb-2',
                          children: [
                            e.jsx('span', {
                              className: `text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${h.cls}`,
                              children: h.label || _.estado
                            }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-1.5',
                              children: [
                                _.prioridad === 'URGENTE' &&
                                  _.estado !== 'RESUELTA' &&
                                  e.jsxs('span', {
                                    className:
                                      'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-rose-100 text-rose-700 border-rose-200 flex items-center gap-1',
                                    children: [e.jsx(pe, { size: 11 }), ' Urgente']
                                  }),
                                A &&
                                  e.jsx('button', {
                                    onClick: () => x(_),
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
                          children: [$.length, ' SKU(s)']
                        }),
                        e.jsxs('p', {
                          className: 'text-xs text-slate-500 line-clamp-2 mt-0.5',
                          children: [
                            $.slice(0, 3)
                              .map((y) => y.codigo_producto)
                              .join(', '),
                            $.length > 3 ? '…' : ''
                          ]
                        }),
                        _.motivo &&
                          e.jsxs('p', {
                            className: 'text-xs text-slate-400 mt-1 italic',
                            children: ['“', _.motivo, '”']
                          }),
                        e.jsxs('p', {
                          className: 'text-[11px] text-slate-400 mt-2',
                          children: [
                            _.asignado_nombre ? `Por ${_.asignado_nombre}` : 'Inventario',
                            ' ·',
                            ' ',
                            _.created_at ? new Date(_.created_at).toLocaleDateString('es-CL') : ''
                          ]
                        }),
                        M &&
                          e.jsxs('div', {
                            className: `mt-2 rounded-lg border px-2.5 py-2 text-[11px] font-bold ${D ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`,
                            children: [
                              '🔒 ',
                              D ? 'En proceso por' : 'Tarea tomada por',
                              ' ',
                              _.locked_by_name || 'otro usuario',
                              ' desde las',
                              ' ',
                              new Date(_.locked_at).toLocaleTimeString('es-CL', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            ]
                          }),
                        L &&
                          e.jsxs('div', {
                            className: 'flex flex-wrap gap-2 mt-3',
                            children: [
                              d &&
                                e.jsxs('button', {
                                  onClick: () => l(_),
                                  title: D ? 'El sistema verificará el bloqueo antes de abrir' : '',
                                  className: `flex-1 px-3 py-2 rounded-xl text-white font-black text-xs flex items-center justify-center gap-1.5 ${D ? 'bg-slate-500 hover:bg-slate-600' : 'bg-emerald-600 hover:bg-emerald-700'}`,
                                  children: [
                                    e.jsx(Re, { size: 14 }),
                                    ' Generar informe / dictamen ',
                                    e.jsx(pa, { size: 14 })
                                  ]
                                }),
                              s &&
                                e.jsx('button', {
                                  onClick: () => O(_),
                                  title: 'Anular',
                                  className:
                                    'px-3 py-2 rounded-xl border border-slate-200 text-slate-500 font-black text-xs flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200',
                                  children: e.jsx(Ps, { size: 14 })
                                })
                            ]
                          }),
                        _.estado === 'RESUELTA' &&
                          e.jsxs('p', {
                            className:
                              'text-[11px] text-emerald-600 font-bold mt-3 flex items-center gap-1',
                            children: [
                              e.jsx(Re, { size: 12 }),
                              ' Resuelta',
                              _.resuelto_nombre ? ` por ${_.resuelto_nombre}` : ''
                            ]
                          })
                      ]
                    },
                    _.id
                  );
                })
              }),
        C && e.jsx(St, { onClose: () => b(!1) })
      ]
    });
  },
  Dt = ({ onClose: s, onCreated: d }) => {
    const l = Ua(),
      [c, A] = v.useState(''),
      [j, t] = v.useState(''),
      [f, u] = v.useState(''),
      [C, b] = v.useState(''),
      [O, x] = v.useState([]),
      [T, _] = v.useState(!0),
      [h, $] = v.useState(''),
      [L, M] = v.useState(''),
      [D, y] = v.useState(!1),
      [o, a] = v.useState([]),
      [m, n] = v.useState([]),
      [p, N] = v.useState(null),
      [R, Y] = v.useState(!1);
    v.useEffect(() => {
      let g = !0;
      return (
        _(!0),
        pt()
          .then((V) => {
            g && x((V == null ? void 0 : V.transportistas) || []);
          })
          .catch((V) => {
            g && S.error(`No se pudo cargar el catálogo de transportistas: ${V.message}`);
          })
          .finally(() => {
            g && _(!1);
          }),
        () => {
          g = !1;
        }
      );
    }, []);
    const W = v.useMemo(() => (C && !O.includes(C) ? [C, ...O] : O), [C, O]),
      F = v.useCallback(async () => {
        if (!c.trim()) {
          S.error('Escribe primero el número de N.V.');
          return;
        }
        Y(!0);
        try {
          const g = await ut(c);
          if (!g) {
            (N(null), S.info(`La N.V ${c.trim()} no está en el Panel PTM (puedes seguir a mano).`));
            return;
          }
          (N(g),
            g.cliente && t(g.cliente),
            g.guia && u(g.guia),
            g.transportista && b(g.transportista),
            g.bultos && $(g.bultos),
            S.success(`N.V ${g.nv} encontrada en el Panel: datos cargados`));
        } catch (g) {
          S.error(`No se pudo consultar el Panel PTM: ${g.message}`);
        } finally {
          Y(!1);
        }
      }, [c]),
      Q = (g) => {
        const V = new Map();
        return (
          (g || []).forEach((q) => {
            const w = `${q.codigo_producto}|${q.partida || ''}`,
              U = V.get(w);
            U
              ? (U.disponible = Number(U.disponible || 0) + (Number(q.disponible) || 0))
              : V.set(w, { ...q, ubicacion: '', disponible: Number(q.disponible) || 0 });
          }),
          [...V.values()]
        );
      },
      Z = v.useCallback(async () => {
        y(!0);
        try {
          a(Q(await Ba(L)));
        } catch (g) {
          S.error(`Error buscando stock: ${g.message}`);
        } finally {
          y(!1);
        }
      }, [L]),
      te = (g) => `${g.codigo_producto}|${g.partida || ''}`,
      ne = (g) => {
        const V = te(g);
        if (m.some((q) => q._key === V)) {
          S.info('Ese SKU ya está agregado');
          return;
        }
        n((q) => [
          ...q,
          {
            _key: V,
            codigo_producto: g.codigo_producto,
            producto: g.producto || '',
            ubicacion: '',
            partida: g.partida || '',
            cantidad: Number(g.disponible) > 0 ? Number(g.disponible) : 1,
            unidad_medida: g.unidad_medida || 'UN'
          }
        ]);
      },
      ee = (g) => n((V) => V.filter((q) => q._key !== g)),
      P = async () => {
        if (!c.trim()) {
          S.error('Escribe la N.V.');
          return;
        }
        if (m.length === 0) {
          S.error('Agrega al menos un SKU');
          return;
        }
        try {
          const g = m.map(({ _key: q, ...w }) => w),
            V = await l.mutateAsync({
              nv: c.trim(),
              skus: g,
              cliente: j.trim() || null,
              guia: f.trim() || null,
              transportista: C.trim() || null,
              bultos: h ? Number(h) : null
            });
          (S.success('Certificación de salida creada'), d(V == null ? void 0 : V.id));
        } catch (g) {
          S.error(`No se pudo crear: ${g.message}`);
        }
      };
    return e.jsx('div', {
      className: 'fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-3',
      onClick: s,
      children: e.jsxs('div', {
        className:
          'bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col',
        onClick: (g) => g.stopPropagation(),
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between p-5 border-b border-slate-100',
            children: [
              e.jsxs('h3', {
                className: 'font-black text-slate-900 flex items-center gap-2',
                children: [
                  e.jsx(Fs, { size: 18, className: 'text-emerald-600' }),
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
                            onChange: (g) => A(g.target.value),
                            onKeyDown: (g) => g.key === 'Enter' && F(),
                            placeholder: 'Ej. 95811',
                            className:
                              'w-full px-3 py-2 rounded-xl border border-emerald-300 text-sm font-bold outline-none focus:border-emerald-500'
                          }),
                          e.jsx('button', {
                            onClick: F,
                            disabled: R || !c.trim(),
                            title: 'Traer datos de la N.V desde el Panel PTM',
                            className:
                              'px-3 py-2 rounded-xl bg-indigo-600 text-white shrink-0 hover:bg-indigo-700 disabled:opacity-40',
                            children: R
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
                        value: f,
                        onChange: (g) => u(g.target.value),
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
                        value: h,
                        onChange: (g) => $(g.target.value.replace(/[^0-9]/g, '')),
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
                        value: j,
                        onChange: (g) => t(g.target.value),
                        placeholder: 'Opcional',
                        title: j,
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
                      e.jsxs('select', {
                        value: C,
                        onChange: (g) => b(g.target.value),
                        disabled: T,
                        className:
                          'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-emerald-400 disabled:bg-slate-50 disabled:text-slate-400',
                        children: [
                          e.jsx('option', {
                            value: '',
                            children: T ? 'Cargando transportistas…' : '— Seleccionar —'
                          }),
                          W.map((g) => e.jsx('option', { value: g, children: g }, g))
                        ]
                      }),
                      e.jsx('p', {
                        className: 'mt-1 text-[10px] text-slate-400',
                        children: 'Catálogo compartido con Ingresar N.V.'
                      })
                    ]
                  })
                ]
              }),
              p &&
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
                          children: ['N.V ', p.nv, ' · Panel Dashboard PTM']
                        }),
                        e.jsxs('span', {
                          className: 'flex items-center gap-1.5',
                          children: [
                            p.urgente &&
                              e.jsx('span', {
                                className:
                                  'px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black',
                                children: 'URGENTE'
                              }),
                            p.estado &&
                              e.jsx('span', {
                                className:
                                  'px-1.5 py-0.5 rounded-md bg-white text-indigo-700 border border-indigo-200 text-[10px] font-black',
                                children: p.estado
                              })
                          ]
                        })
                      ]
                    }),
                    e.jsxs('div', {
                      className: 'grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-slate-600',
                      children: [
                        p.vendedor &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'Vendedor:' }),
                              ' ',
                              p.vendedor
                            ]
                          }),
                        p.factura &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'Factura:' }),
                              ' ',
                              p.factura
                            ]
                          }),
                        p.numeroEnvio &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'N° envío:' }),
                              ' ',
                              p.numeroEnvio
                            ]
                          }),
                        p.tipoDespacho &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', {
                                className: 'text-slate-400',
                                children: 'Tipo despacho:'
                              }),
                              ' ',
                              p.tipoDespacho
                            ]
                          }),
                        p.fechaCompromiso &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'Compromiso:' }),
                              ' ',
                              p.fechaCompromiso.split('-').reverse().join('-')
                            ]
                          }),
                        p.fechaDespacho &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'Despacho:' }),
                              ' ',
                              p.fechaDespacho.split('-').reverse().join('-')
                            ]
                          }),
                        p.division &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', { className: 'text-slate-400', children: 'División:' }),
                              ' ',
                              p.division
                            ]
                          }),
                        p.centroCosto &&
                          e.jsxs('span', {
                            children: [
                              e.jsx('b', {
                                className: 'text-slate-400',
                                children: 'Centro costo:'
                              }),
                              ' ',
                              p.centroCosto
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
                        value: L,
                        onChange: (g) => M(g.target.value),
                        onKeyDown: (g) => g.key === 'Enter' && Z(),
                        placeholder: 'Buscar SKU actual o antiguo por código o descripción…',
                        className: 'flex-1 text-sm outline-none bg-transparent'
                      })
                    ]
                  }),
                  e.jsxs('button', {
                    onClick: Z,
                    disabled: D,
                    className:
                      'px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 disabled:opacity-50',
                    children: [
                      D
                        ? e.jsx(ce, { size: 16, className: 'animate-spin' })
                        : e.jsx(ue, { size: 16 }),
                      ' ',
                      'Buscar'
                    ]
                  })
                ]
              }),
              o.length > 0 &&
                e.jsx('div', {
                  className:
                    'border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-44 overflow-y-auto',
                  children: o.map((g, V) =>
                    e.jsxs(
                      'button',
                      {
                        onClick: () => ne(g),
                        className:
                          'w-full text-left px-3 py-2 hover:bg-emerald-50/50 flex items-center justify-between gap-2',
                        children: [
                          e.jsxs('span', {
                            className: 'min-w-0',
                            children: [
                              e.jsxs('span', {
                                className: 'font-bold text-sm text-slate-800 truncate block',
                                children: [g.codigo_producto, ' · ', g.producto]
                              }),
                              e.jsxs('span', {
                                className:
                                  'text-xs text-slate-400 flex items-center gap-1.5 flex-wrap',
                                children: [
                                  e.jsxs('span', {
                                    children: [
                                      g.partida || 's/partida',
                                      ' · ',
                                      g.disponible,
                                      ' ',
                                      g.unidad_medida,
                                      ' disponibles'
                                    ]
                                  }),
                                  g.es_historico &&
                                    e.jsx('span', {
                                      className:
                                        'px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold',
                                      children: 'SKU histórico'
                                    })
                                ]
                              })
                            ]
                          }),
                          e.jsx(Ee, { size: 16, className: 'text-emerald-500 shrink-0' })
                        ]
                      },
                      V
                    )
                  )
                }),
              e.jsxs('div', {
                children: [
                  e.jsxs('p', {
                    className:
                      'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5',
                    children: ['SKUs del despacho (', m.length, ')']
                  }),
                  m.length === 0
                    ? e.jsx('p', {
                        className: 'text-xs text-slate-400',
                        children: 'Agrega los SKUs que se están despachando en esta N.V.'
                      })
                    : e.jsx('div', {
                        className: 'space-y-1.5',
                        children: m.map((g) =>
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
                                      children: [g.codigo_producto, ' · ', g.producto]
                                    }),
                                    e.jsxs('span', {
                                      className: 'text-xs text-slate-400',
                                      children: [
                                        g.partida || 's/partida',
                                        ' · ',
                                        g.cantidad,
                                        ' ',
                                        g.unidad_medida
                                      ]
                                    })
                                  ]
                                }),
                                e.jsxs('label', {
                                  className:
                                    'flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase shrink-0',
                                  children: [
                                    'Cant.',
                                    e.jsx('input', {
                                      type: 'number',
                                      min: '1',
                                      step: '1',
                                      value: g.cantidad,
                                      onChange: (V) => {
                                        const q = Math.max(1, Number(V.target.value) || 1);
                                        n((w) =>
                                          w.map((U) =>
                                            U._key === g._key ? { ...U, cantidad: q } : U
                                          )
                                        );
                                      },
                                      className:
                                        'w-20 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-emerald-400'
                                    })
                                  ]
                                }),
                                e.jsx('button', {
                                  onClick: () => ee(g._key),
                                  className:
                                    'p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 shrink-0',
                                  children: e.jsx(me, { size: 15 })
                                })
                              ]
                            },
                            g._key
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
                onClick: P,
                disabled: l.isPending || !c.trim() || m.length === 0,
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
  It = ({ tarea: s, onBack: d, canManage: l }) => {
    const c = Vs(),
      A = Ks(),
      j = s.estado === 'CONFORME' || s.estado === 'NO_CONFORME',
      t = j || !l,
      f = s.contexto || {},
      u = (k) => {
        const { _extras: I, ...H } = k || {};
        return { resp: H, extras: I || {} };
      },
      [C, b] = v.useState(() => u(s.checklist).resp),
      [O, x] = v.useState(() => u(s.checklist).extras),
      [T, _] = v.useState(s.observaciones || ''),
      [h, $] = v.useState(s.disposicion || '');
    v.useEffect(() => {
      const { resp: k, extras: I } = u(s.checklist);
      (b(k), x(I), _(s.observaciones || ''), $(s.disposicion || ''));
    }, [s.id]);
    const L = (k, I) => b((H) => ({ ...H, [k]: { ...H[k], estado: I } })),
      M = (k, I) => b((H) => ({ ...H, [k]: { ...H[k], nota: I } })),
      D = (k, I) => b((H) => ({ ...H, [k]: { ...H[k], evidencia: I } })),
      y = (k, I) => x((H) => ({ ...H, [k]: I })),
      {
        answeredAll: o,
        hasNo: a,
        faltan: m
      } = v.useMemo(() => {
        var H;
        let k = 0,
          I = !1;
        for (const se of Qe) {
          const ae = (H = C[se.id]) == null ? void 0 : H.estado;
          (ae && k++, ae === 'NO' && (I = !0));
        }
        return { answeredAll: k === Qe.length, hasNo: I, faltan: Qe.length - k };
      }, [C]),
      n = async (k) => {
        try {
          const I = { tipo: 'SALIDA' };
          if (k === 'pdf') {
            const H = u(s.checklist).extras.evidencias || O.evidencias || [],
              se = [];
            for (const ae of H)
              try {
                const xe = await ls(Le, ae.path);
                if (!xe) continue;
                const ie = await fetch(xe).then((z) => (z.ok ? z.blob() : null));
                if (!ie || !/image\/(jpeg|png)/.test(ie.type)) continue;
                const i = await new Promise((z, B) => {
                  const r = new FileReader();
                  ((r.onload = () => z(r.result)), (r.onerror = B), r.readAsDataURL(ie));
                });
                se.push({ tipo: ae.tipo, dataUrl: i });
              } catch {}
            ((I.evidenciasImg = se), await na(s, Ze, I));
          } else await ra(s, Ze, I);
        } catch (I) {
          S.error(`No se pudo generar el documento: ${I.message}`);
        }
      },
      p = async () => {
        if (
          confirm(
            '¿Firmar digitalmente este certificado de salida? Quedará sellado y verificable por folio/QR.'
          )
        )
          try {
            const k = await A.mutateAsync(s.id);
            S.success(`Documento firmado por ${(k == null ? void 0 : k.firmado_nombre) || ''}`);
          } catch (k) {
            S.error(`No se pudo firmar: ${k.message}`);
          }
      },
      N = (k = O) => ({ ...C, _extras: k }),
      R = async () => {
        try {
          (await c.mutateAsync({
            tareaId: s.id,
            checklist: N(),
            observaciones: T,
            disposicion: h,
            finalizar: !1
          }),
            S.success('Avance guardado'));
        } catch (k) {
          S.error(`No se pudo guardar: ${k.message}`);
        }
      },
      Y = async () => {
        if (!o) {
          S.error(`Faltan ${m} ítem(s) por responder`);
          return;
        }
        const k = a ? 'NO_CONFORME' : 'CONFORME';
        if (k === 'NO_CONFORME' && !h) {
          S.error('Selecciona la disposición antes de finalizar');
          return;
        }
        if (
          confirm(
            k === 'CONFORME'
              ? 'Todos los ítems conformes → se emitirá el CERTIFICADO DE CONFORMIDAD DE SALIDA (folio CERT-SAL-) y la tarea quedará bloqueada. ¿Continuar?'
              : `Hay ítems NO conformes → SALIDA NO CONFORME (folio ACTA-SAL-), disposición "${h}". No despachar hasta resolver. ¿Continuar?`
          )
        )
          try {
            const I = await c.mutateAsync({
              tareaId: s.id,
              checklist: N(),
              observaciones: T,
              disposicion: h,
              finalizar: !0,
              resultado: k
            });
            k === 'CONFORME'
              ? (S.success(`Salida certificada ${(I == null ? void 0 : I.folio) || ''}`), d())
              : S.warning('Salida NO CONFORME. No despachar hasta resolver.');
          } catch (I) {
            S.error(`No se pudo finalizar: ${I.message}`);
          }
      },
      W = v.useRef(null),
      [F, Q] = v.useState(!1),
      Z = typeof navigator < 'u' && navigator.maxTouchPoints > 0,
      [te, ne] = v.useState(null),
      [ee, P] = v.useState(!1),
      [g, V] = v.useState({}),
      q = O.evidencias || [];
    v.useEffect(() => {
      let k = !0;
      return (
        is(
          Le,
          q.map((I) => I.path)
        ).then((I) => {
          k && V(I);
        }),
        () => {
          k = !1;
        }
      );
    }, [JSON.stringify(q.map((k) => k.path))]);
    const w = (k, I = 'galeria') => {
        var H;
        (ne(k), I === 'camara' ? Q(!0) : (H = W.current) == null || H.click());
      },
      U = async (k) => {
        var H;
        const I = Array.from(k.target.files || []);
        if (((k.target.value = ''), !(!I.length || !te))) {
          P(!0);
          try {
            const se = [];
            for (const ae of I) {
              if (!ae.type.startsWith('image/')) continue;
              const xe = await vs(ae),
                ie = await Ga({ tareaId: s.id, tipo: te, blob: xe });
              se.push({ tipo: te, path: ie, subido_en: new Date().toISOString() });
            }
            if (se.length) {
              const ae = { ...O, evidencias: [...q, ...se] };
              (x(ae),
                await c.mutateAsync({
                  tareaId: s.id,
                  checklist: N(ae),
                  observaciones: T,
                  disposicion: h,
                  finalizar: !1
                }),
                S.success(
                  se.length > 1 ? 'Fotos agregadas al certificado' : 'Foto agregada al certificado'
                ));
            }
          } catch (se) {
            S.error(
              (H = se == null ? void 0 : se.message) != null && H.includes('row-level security')
                ? 'No tienes permiso para subir fotos'
                : `Error al subir: ${se.message}`
            );
          } finally {
            (P(!1), ne(null));
          }
        }
      },
      J = async (k) => {
        if (confirm('¿Eliminar esta foto del certificado?'))
          try {
            await Js(k.path);
            const I = { ...O, evidencias: q.filter((H) => H.path !== k.path) };
            (x(I),
              await c.mutateAsync({
                tareaId: s.id,
                checklist: N(I),
                observaciones: T,
                disposicion: h,
                finalizar: !1
              }),
              S.success('Foto eliminada'));
          } catch {
            S.error('No se pudo eliminar la foto');
          }
      },
      oe = (k) =>
        x((I) => {
          const H = new Set(I.riesgos || []);
          return k === 'NINGUNO'
            ? { ...I, riesgos: H.has('NINGUNO') ? [] : ['NINGUNO'] }
            : (H.delete('NINGUNO'), H.has(k) ? H.delete(k) : H.add(k), { ...I, riesgos: [...H] });
        }),
      X = Number(O.bultosTotal ?? s.bultos) || 0,
      de = Array.isArray(O.bultosEtiquetas) ? O.bultosEtiquetas : [],
      _e = (k) => {
        const I = Array.from({ length: X }, (H, se) => !!de[se]);
        ((I[k] = !I[k]), y('bultosEtiquetas', I));
      },
      be = O.pesos || {},
      le = us(be.esperado, be.registrado),
      we = j
        ? ke(s)
        : o
          ? a
            ? h === 'Despachar con salvedades (autorizado)'
              ? { ...Ue.NARANJA }
              : { ...Ue.ROJO }
            : { ...Ue.VERDE }
          : { ...Ue.PENDIENTE },
      he = ({ pid: k, val: I, icon: H, activeCls: se }) => {
        var xe;
        const ae = ((xe = C[k]) == null ? void 0 : xe.estado) === I;
        return e.jsx('button', {
          type: 'button',
          disabled: t,
          onClick: () => L(k, I),
          className: `w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shrink-0
          ${ae ? se : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'} ${t ? 'opacity-60 cursor-default' : ''}`,
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
                          children: s.proveedor || f.cliente || 'Sin cliente'
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
                        e.jsxs('span', { children: ['NV ', s.oc || f.nv || '—'] }),
                        e.jsxs('span', { children: ['Guía ', f.guia || '—'] }),
                        f.factura && e.jsxs('span', { children: ['Factura ', f.factura] }),
                        e.jsxs('span', {
                          className: 'flex items-center gap-1',
                          children: [e.jsx(Ts, { size: 12 }), ' ', s.fecha_recepcion || '—']
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
                      children: [e.jsx($s, { size: 15 }), ' PDF']
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
                      children: j
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
        Array.isArray(f.skus) &&
          f.skus.length > 0 &&
          e.jsxs('div', {
            className: 'bg-white rounded-2xl border border-slate-200 p-5 mb-4',
            children: [
              e.jsxs('h3', {
                className: 'text-sm font-black text-slate-800 mb-3 flex items-center gap-2',
                children: [
                  e.jsx($e, { size: 16, className: 'text-slate-400' }),
                  ' SKUs del despacho (',
                  f.skus.length,
                  ')'
                ]
              }),
              e.jsx('div', {
                className: 'space-y-1.5',
                children: f.skus.map((k, I) =>
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
                    I
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
          : j && l
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
                    onClick: p,
                    disabled: A.isPending,
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
                      children: k.params.map((I) => {
                        var H, se, ae, xe, ie, i, z;
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
                                  ((H = C[I.id]) == null ? void 0 : H.estado) &&
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
                                            ((se = C[I.id]) == null ? void 0 : se.evidencia) || '',
                                          disabled: t,
                                          onChange: (B) => D(I.id, B.target.value),
                                          className: `px-2 py-1 rounded-lg border text-[11px] font-bold ${(ae = C[I.id]) != null && ae.evidencia ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 text-slate-400'}`,
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
                                  ((xe = C[I.id]) == null ? void 0 : xe.estado) === 'NO' &&
                                    e.jsx('input', {
                                      value: ((ie = C[I.id]) == null ? void 0 : ie.nota) || '',
                                      disabled: t,
                                      onChange: (B) => M(I.id, B.target.value),
                                      placeholder: 'Detalle de la no conformidad…',
                                      className:
                                        'mt-1.5 w-full px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/40 text-xs outline-none focus:border-rose-400'
                                    }),
                                  ((i = C[I.id]) == null ? void 0 : i.estado) === 'NA' &&
                                    e.jsx('input', {
                                      value: ((z = C[I.id]) == null ? void 0 : z.nota) || '',
                                      disabled: t,
                                      onChange: (B) => M(I.id, B.target.value),
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
                                    pid: I.id,
                                    val: 'OK',
                                    icon: e.jsx(ze, { size: 16 }),
                                    activeCls: 'bg-emerald-500 border-emerald-500 text-white'
                                  }),
                                  e.jsx(he, {
                                    pid: I.id,
                                    val: 'NO',
                                    icon: e.jsx(Ie, { size: 16 }),
                                    activeCls: 'bg-rose-500 border-rose-500 text-white'
                                  }),
                                  e.jsx(he, {
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
                k.nivel
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
                          onChange: (k) =>
                            y('pesos', {
                              ...be,
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
                          value: be.registrado || '',
                          disabled: t,
                          inputMode: 'decimal',
                          onChange: (k) =>
                            y('pesos', {
                              ...be,
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
                          value: O.bultosTotal ?? s.bultos ?? '',
                          disabled: t,
                          inputMode: 'numeric',
                          onChange: (k) => y('bultosTotal', k.target.value.replace(/[^0-9]/g, '')),
                          className:
                            'w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-black text-center outline-none focus:border-emerald-400'
                        })
                      ]
                    })
                  ]
                }),
                X > 0
                  ? e.jsxs(e.Fragment, {
                      children: [
                        e.jsx('div', {
                          className: 'flex flex-wrap gap-2',
                          children: Array.from({ length: Math.min(X, 60) }, (k, I) =>
                            e.jsxs(
                              'button',
                              {
                                type: 'button',
                                disabled: t,
                                onClick: () => _e(I),
                                className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${de[I] ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'}`,
                                children: [
                                  'Bulto ',
                                  I + 1,
                                  '/',
                                  X,
                                  ' · ',
                                  de[I] ? 'Etiqueta OK' : 'Pendiente'
                                ]
                              },
                              I
                            )
                          )
                        }),
                        e.jsxs('p', {
                          className: 'text-xs font-bold mt-2 text-slate-500',
                          children: [
                            de.slice(0, X).filter(Boolean).length,
                            '/',
                            X,
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
                  children: ps.map((k) => {
                    const I = (O.riesgos || []).includes(k.id);
                    return e.jsxs(
                      'button',
                      {
                        type: 'button',
                        disabled: t,
                        onClick: () => oe(k.id),
                        className: `px-3 py-2 rounded-xl border text-xs font-black transition-colors ${I ? (k.id === 'NINGUNO' ? 'bg-slate-700 border-slate-700 text-white' : 'bg-amber-500 border-amber-500 text-white') : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'}`,
                        children: [I ? '☑' : '☐', ' ', k.label]
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
                    e.jsx(Te, { size: 16, className: 'text-slate-400' }),
                    ' Evidencia fotográfica'
                  ]
                }),
                e.jsx('div', {
                  className: 'grid sm:grid-cols-3 gap-3',
                  children: Fa.map((k) => {
                    const I = q.filter((H) => H.tipo === k.id);
                    return e.jsxs(
                      'div',
                      {
                        className: 'rounded-xl border border-slate-100 p-3',
                        children: [
                          e.jsxs('p', {
                            className:
                              'text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2',
                            children: ['📷 ', k.label, ' (', I.length, ')']
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2 flex-wrap',
                            children: [
                              I.map((H) =>
                                e.jsxs(
                                  'div',
                                  {
                                    className:
                                      'relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0',
                                    children: [
                                      e.jsx('a', {
                                        href: g[H.path] || '#',
                                        target: '_blank',
                                        rel: 'noreferrer',
                                        children: e.jsx('img', {
                                          src: g[H.path] || '',
                                          alt: k.label,
                                          className: 'w-full h-full object-cover'
                                        })
                                      }),
                                      !t &&
                                        e.jsx('button', {
                                          onClick: () => J(H),
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
                                Z &&
                                e.jsxs('button', {
                                  type: 'button',
                                  onClick: () => w(k.id, 'camara'),
                                  disabled: ee,
                                  title: 'Tomar foto con la cámara',
                                  className:
                                    'w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-emerald-300 text-emerald-500 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40',
                                  children: [
                                    ee && te === k.id
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
                                  onClick: () => w(k.id, 'galeria'),
                                  disabled: ee,
                                  title: 'Subir foto desde archivos/galería',
                                  className:
                                    'w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40',
                                  children: [
                                    ee && te === k.id
                                      ? e.jsx(Ne, { size: 16, className: 'animate-spin' })
                                      : e.jsx(rs, { size: 16 }),
                                    e.jsx('span', {
                                      className: 'text-[8px] font-black uppercase',
                                      children: Z ? 'Galería' : 'Foto'
                                    })
                                  ]
                                }),
                              I.length === 0 &&
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
                  ref: W,
                  type: 'file',
                  accept: 'image/*',
                  multiple: !0,
                  onChange: U,
                  className: 'hidden'
                }),
                F &&
                  e.jsx(_s, {
                    onCapture: (k) => U({ target: { files: [k], value: '' } }),
                    onClose: () => Q(!1)
                  }),
                e.jsx('p', {
                  className: 'text-[10px] text-slate-400 mt-2',
                  children:
                    'Las fotos quedan asociadas al certificado (bucket privado) y se incrustan en el PDF.'
                })
              ]
            }),
            (a || h) &&
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
                    value: h,
                    disabled: t,
                    onChange: (k) => $(k.target.value),
                    className:
                      'mt-1.5 w-full px-3 py-2 rounded-xl border border-rose-200 text-sm font-bold outline-none focus:border-rose-400 bg-white',
                    children: [
                      e.jsx('option', { value: '', children: '— Seleccionar disposición —' }),
                      Ma.map((k) => e.jsx('option', { value: k, children: k }, k))
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
                  value: T,
                  disabled: t,
                  onChange: (k) => _(k.target.value),
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
                    onClick: R,
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
                          children: [e.jsx(Ps, { size: 16 }), ' Finalizar (No Conforme)']
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
  zt = () => {
    const { hasPermission: s, user: d } = ve(),
      l = s('manage_quality') || s('manage_monitoreo'),
      c = (d == null ? void 0 : d.rol) === 'ADMIN' || (d == null ? void 0 : d.es_admin_delegado),
      { data: A = [], isLoading: j, refetch: t, isFetching: f } = Pa(),
      u = Hs(),
      [C, b] = v.useState(null),
      [O, x] = v.useState(!1),
      [T, _] = v.useState(''),
      [h, $] = v.useState('TODOS'),
      L = async (o, a) => {
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
      M = A.filter((o) => o.estado === 'PENDIENTE' || o.estado === 'EN_PROCESO').length,
      D = v.useMemo(() => {
        const o = T.trim().toLocaleLowerCase('es-CL');
        return A.filter((a) => {
          const m = a.contexto || {};
          return (
            (!o ||
              [a.oc, a.proveedor, a.folio, m.cliente, m.guia, m.transportista].some((p) =>
                String(p || '')
                  .toLocaleLowerCase('es-CL')
                  .includes(o)
              )) &&
            (h === 'TODOS' || a.estado === h)
          );
        });
      }, [T, h, A]),
      y = (C && A.find((o) => o.id === C)) || null;
    return y
      ? e.jsx(It, { tarea: y, onBack: () => b(null), canManage: l })
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
                          disabled: f,
                          className:
                            'px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50',
                          children: [
                            e.jsx(Ne, { size: 14, className: f ? 'animate-spin' : '' }),
                            ' Actualizar'
                          ]
                        }),
                        l &&
                          e.jsxs('button', {
                            onClick: () => x(!0),
                            className:
                              'px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-emerald-700',
                            children: [e.jsx(Fs, { size: 14 }), ' Certificar salida (N.V. + SKU)']
                          })
                      ]
                    })
                  ]
                }),
                e.jsxs('div', {
                  className: 'mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2',
                  children: [
                    e.jsx(Xe, { label: 'Total', value: A.length, tone: 'slate' }),
                    e.jsx(Xe, { label: 'Por certificar', value: M, tone: 'amber' }),
                    e.jsx(Xe, { label: 'Emitidas', value: A.length - M, tone: 'emerald' })
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
                          value: T,
                          onChange: (o) => _(o.target.value),
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
                              onClick: () => $(o),
                              className: `whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-black tracking-wide transition ${h === o ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-200'}`,
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
                !j &&
                  e.jsxs('p', {
                    className: 'mt-2 text-[11px] font-bold text-slate-400',
                    children: ['Mostrando ', D.length, ' de ', A.length, ' certificaciones.']
                  })
              ]
            }),
            j
              ? e.jsx('div', {
                  className: 'flex justify-center py-20',
                  children: e.jsx(ce, { className: 'animate-spin text-emerald-500', size: 36 })
                })
              : A.length === 0
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
                : D.length === 0
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
                            (_(''), $('TODOS'));
                          },
                          className: 'mt-2 text-xs font-black text-teal-600 hover:text-teal-700',
                          children: 'Limpiar filtros'
                        })
                      ]
                    })
                  : e.jsx('div', {
                      className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
                      children: D.map((o) => {
                        const a = De[o.estado] || {},
                          m = o.contexto || {},
                          n = o.estado === 'PENDIENTE' || o.estado === 'EN_PROCESO';
                        return e.jsxs(
                          'div',
                          {
                            role: 'button',
                            tabIndex: 0,
                            onClick: () => b(o.id),
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
                                          onClick: (p) => L(o, p),
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
                                      const p = ke(o);
                                      return e.jsxs('span', {
                                        className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${p.cls}`,
                                        children: [p.emoji, ' ', p.label]
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
              e.jsx(Dt, {
                onClose: () => x(!1),
                onCreated: (o) => {
                  (x(!1), o && b(o));
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
  Tt = () => {
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
  Os = {
    MONITOREO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DANOS: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  $t = ({ codigo: s, value: d, onSelect: l }) => {
    const [c, A] = v.useState(!1),
      [j, t] = v.useState(''),
      [f, u] = v.useState([]),
      [C, b] = v.useState(!1),
      O = zs.useRef(null);
    (v.useEffect(() => {
      if (!c) return;
      let T = !0;
      b(!0);
      const _ = setTimeout(async () => {
        try {
          const h = await xt(s, j);
          T && u(h);
        } catch {
          T && u([]);
        } finally {
          T && b(!1);
        }
      }, 220);
      return () => {
        ((T = !1), clearTimeout(_));
      };
    }, [c, j, s]),
      v.useEffect(() => {
        const T = (_) => {
          O.current && !O.current.contains(_.target) && A(!1);
        };
        return (
          c && document.addEventListener('mousedown', T),
          () => document.removeEventListener('mousedown', T)
        );
      }, [c]));
    const x = (T) => {
      (l(T.valor, T.ubicacion || ''), A(!1), t(''));
    };
    return e.jsxs('div', {
      className: 'relative',
      ref: O,
      children: [
        e.jsxs('button', {
          type: 'button',
          onClick: () => A((T) => !T),
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
                  value: j,
                  onChange: (T) => t(T.target.value),
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
                  : f.length === 0
                    ? e.jsxs('div', {
                        className: 'py-5 text-center text-xs text-slate-400',
                        children: ['Sin lotes/series ', j ? `para "${j}"` : '']
                      })
                    : f.map((T, _) =>
                        e.jsxs(
                          'button',
                          {
                            type: 'button',
                            onClick: () => x(T),
                            className:
                              'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-emerald-50/50 border-b border-slate-50 last:border-0',
                            children: [
                              e.jsx('span', {
                                className: `text-[9px] font-black px-1.5 py-0.5 rounded ${T.tipo === 'P' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`,
                                children: T.tipo === 'P' ? 'LOTE' : 'SERIE'
                              }),
                              e.jsx('span', {
                                className:
                                  'font-mono text-xs font-bold text-slate-800 truncate flex-1',
                                children: T.valor
                              }),
                              T.ubicacion &&
                                e.jsx('span', {
                                  className: 'text-[10px] text-slate-400 font-mono shrink-0',
                                  children: T.ubicacion
                                }),
                              e.jsx('span', {
                                className: `text-xs font-bold shrink-0 ${Number(T.disponible) > 0 ? 'text-emerald-600' : 'text-slate-300'}`,
                                children: Number(T.disponible) || 0
                              })
                            ]
                          },
                          _
                        )
                      )
              })
            ]
          })
      ]
    });
  },
  Ss = 'Lote no encontrado en el sistema al momento de la inspección',
  Lt = [
    { id: 'system', label: 'Sistema' },
    { id: 'manual', label: 'Manual' },
    { id: 'none', label: 'Sin lote/partida' },
    { id: 'not_found', label: 'No corresponde a los mostrados' }
  ],
  Pt = ({ item: s, onChange: d }) => {
    const l = s.batch_source || (s.partida ? 'system' : 'none'),
      c = s.batch_value ?? s.partida ?? '',
      A = (t) => {
        var u;
        const f = {
          batch_source: t,
          batch_value: ['none', 'not_found'].includes(t) ? null : '',
          partida: ''
        };
        (t === 'not_found' &&
          !String(s.observaciones || '').includes(Ss) &&
          (f.observaciones = [(u = s.observaciones) == null ? void 0 : u.trim(), Ss]
            .filter(Boolean)
            .join(' · ')),
          d(f));
      },
      j = (t, f = '') =>
        d({ batch_value: t || null, partida: t || '', ...(f ? { ubicacion: f } : {}) });
    return e.jsxs('div', {
      className: 'mt-1 rounded-xl border border-slate-200 p-3 bg-slate-50/50',
      children: [
        e.jsx('div', {
          className: 'grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3',
          children: Lt.map((t) =>
            e.jsxs(
              'label',
              {
                className: `flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[11px] font-bold cursor-pointer ${l === t.id ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`,
                children: [
                  e.jsx('input', {
                    type: 'radio',
                    name: `batch-${s._key}`,
                    checked: l === t.id,
                    onChange: () => A(t.id)
                  }),
                  t.label
                ]
              },
              t.id
            )
          )
        }),
        l === 'system' && e.jsx($t, { codigo: s.codigo_producto, value: c, onSelect: j }),
        l === 'manual' &&
          e.jsx('input', {
            value: c,
            onChange: (t) => j(t.target.value.toUpperCase()),
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
  Rs = ({
    informe: s,
    prefillItems: d,
    asignacion: l,
    asignacionId: c,
    onCancel: A,
    onSaved: j
  }) => {
    const { user: t } = ve(),
      f = ia(),
      u = !!s,
      C = Wa(),
      b = Qa(),
      { data: O } = bs(u ? s.id : null),
      x = (l == null ? void 0 : l.id) || c || null,
      [T, _] = v.useState((s == null ? void 0 : s.bodega) || ''),
      [h, $] = v.useState((s == null ? void 0 : s.periodicidad) || 'SEMANAL'),
      [L, M] = v.useState((s == null ? void 0 : s.observaciones) || ''),
      [D, y] = v.useState(''),
      [o, a] = v.useState(!1),
      [m, n] = v.useState([]),
      [p, N] = v.useState(!1),
      [R, Y] = v.useState([]),
      [W, F] = v.useState(null),
      [Q, Z] = v.useState([]),
      [te, ne] = v.useState(!x),
      [ee, P] = v.useState({ status: 'idle', savedAt: null, error: '' }),
      [g, V] = v.useState(
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
      q = v.useRef(!1);
    v.useEffect(() => {
      u &&
        O &&
        !q.current &&
        ((q.current = !0),
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
    const w = v.useRef(!1);
    v.useEffect(() => {
      var i, z, B;
      if (!u && x && !w.current) {
        w.current = !0;
        const r = l == null ? void 0 : l.progress_data,
          E = Array.isArray(r == null ? void 0 : r.items) ? r.items : null;
        if (E != null && E.length) {
          (_(((i = r == null ? void 0 : r.header) == null ? void 0 : i.bodega) || ''),
            $(((z = r == null ? void 0 : r.header) == null ? void 0 : z.periodicidad) || 'SEMANAL'),
            M(((B = r == null ? void 0 : r.header) == null ? void 0 : B.observaciones) || ''),
            Z(Array.isArray(r == null ? void 0 : r.selected_sku_ids) ? r.selected_sku_ids : []),
            Y(
              E.map((K, re) => ({
                ...K,
                _key:
                  K._key ||
                  `${K.codigo_producto}|${K.batch_value || K.partida || ''}|${K.ubicacion || ''}|${re}`,
                revision_estado: K.revision_estado || 'PENDIENTE',
                batch_source: K.batch_source || (K.partida ? 'system' : 'none'),
                batch_value: K.batch_value ?? K.partida ?? null
              }))
            ),
            P({
              status: 'saved',
              savedAt:
                (l == null ? void 0 : l.progress_updated_at) ||
                (r == null ? void 0 : r.saved_at) ||
                null,
              error: ''
            }),
            ne(!0));
          return;
        }
        const G = Array.isArray(d) ? d : (l == null ? void 0 : l.skus) || [];
        (Y(
          G.map((K) => ({
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
          ne(!0));
      }
    }, [l, u, d, x]);
    const U = v.useCallback(async () => {
        N(!0);
        try {
          const i = await Ws(D, o);
          n(i);
        } catch (i) {
          S.error(`Error buscando stock: ${i.message}`);
        } finally {
          N(!1);
        }
      }, [D, o]),
      J = (i) => {
        const z = `${i.codigo_producto}|${i.partida || ''}|${i.ubicacion || ''}`;
        if (R.some((B) => B._key === z)) {
          S.info('Ese ítem ya está en el informe');
          return;
        }
        Y((B) => [
          ...B,
          {
            _key: z,
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
      oe = () => {
        const i = (W.codigo || '').trim().toUpperCase(),
          z = (W.ubicacion || '').trim().toUpperCase();
        if (!i) {
          S.error('Ingresa el código del producto');
          return;
        }
        if (!z) {
          S.error('La ubicación es obligatoria');
          return;
        }
        const B = `MAN|${i}|${(W.partida || '').trim()}|${z}`;
        if (R.some((r) => r._key === B)) {
          S.info('Ese ítem ya está en el informe');
          return;
        }
        (Y((r) => [
          ...r,
          {
            _key: B,
            codigo_producto: i,
            partida: (W.partida || '').trim().toUpperCase(),
            ubicacion: z,
            producto: (W.producto || '').trim() || 'SIN DESCRIPCIÓN',
            unidad_medida: 'UN',
            cantidad: Number(W.cantidad) || 0,
            estado_inventario: 'No registrado',
            tipo: 'NO_PERECIBLE',
            fecha_vencimiento: null,
            semaforo: 'NA',
            condicion_observada: 'Sobrante',
            cantidad_afectada: Number(W.cantidad) || 0,
            no_registrado: !0,
            motivo: 'Hallazgo',
            observaciones: '',
            batch_source: W.partida ? 'manual' : 'none',
            batch_value: W.partida || null,
            revision_estado: 'RECHAZADO'
          }
        ]),
          F(null),
          S.success('Ítem manual agregado (no registrado)'));
      },
      X = (i, z, B) => {
        Y((r) => r.map((E) => (E._key === i ? { ...E, [z]: B } : E)));
      },
      de = (i, z) => {
        Y((B) => B.map((r) => (r._key === i ? { ...r, ...z } : r)));
      },
      _e = (i, z) =>
        Y((B) =>
          B.map((r) =>
            r._key === i
              ? {
                  ...r,
                  condicion_observada: z,
                  revision_estado: z === 'OK' ? 'APROBADO' : 'RECHAZADO',
                  ...(z === 'OK' ? { cantidad_afectada: 0 } : {})
                }
              : r
          )
        ),
      be = (i) => {
        (Y((z) => z.filter((B) => B._key !== i)), Z((z) => z.filter((B) => B !== i)));
      },
      le = (i) => Z((z) => (z.includes(i) ? z.filter((B) => B !== i) : [...z, i])),
      we = () => Z((i) => (i.length === R.length ? [] : R.map((z) => z._key))),
      he = (i) => {
        if (Q.length === 0) {
          S.info('Selecciona uno o más SKUs');
          return;
        }
        Y((z) =>
          z.map((B) =>
            Q.includes(B._key)
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
      ye = v.useMemo(
        () => ({
          version: 1,
          saved_at: new Date().toISOString(),
          header: { bodega: T, periodicidad: h, observaciones: L },
          items: R,
          selected_sku_ids: Q
        }),
        [T, R, L, h, Q]
      );
    v.useEffect(() => {
      if (!x || !te || ee.status === 'conflict') return;
      P((z) => ({ ...z, status: 'pending', error: '' }));
      const i = window.setTimeout(async () => {
        P((z) => ({ ...z, status: 'saving', error: '' }));
        try {
          const z = await Za(x, ye);
          (P({
            status: 'saved',
            savedAt: (z == null ? void 0 : z.saved_at) || new Date().toISOString(),
            error: ''
          }),
            V({
              name:
                (z == null ? void 0 : z.locked_by_name) ||
                (g == null ? void 0 : g.name) ||
                (t == null ? void 0 : t.nombre) ||
                'Usuario actual',
              at: (z == null ? void 0 : z.locked_at) || new Date().toISOString()
            }));
        } catch (z) {
          const B =
            (z == null ? void 0 : z.code) === 'QUALITY_TASK_LOCKED' ||
            (z == null ? void 0 : z.status) === 409;
          P({
            status: B ? 'conflict' : 'error',
            savedAt: null,
            error: (z == null ? void 0 : z.message) || 'No se pudo guardar el progreso'
          });
        }
      }, 1500);
      return () => window.clearTimeout(i);
    }, [te, ye, x, t == null ? void 0 : t.nombre]);
    const k = async () => {
        if (x && ee.status !== 'conflict')
          try {
            await lt(x);
          } catch (i) {
            console.warn('No se pudo liberar el bloqueo de Calidad', i);
          }
        A();
      },
      I = async (i) => {
        if (R.length === 0) {
          S.error('Agrega al menos un ítem');
          return;
        }
        if (i === 'ENVIADO_CALIDAD') {
          const B = R.filter((G) => !(G.ubicacion || '').trim());
          if (B.length > 0) {
            S.error(`${B.length} ítem(s) sin ubicación. Es obligatoria para enviar a Calidad.`);
            return;
          }
          const r = R.filter(
            (G) =>
              ['system', 'manual'].includes(G.batch_source) &&
              !(G.batch_value || G.partida || '').trim()
          );
          if (r.length > 0) {
            S.error(`${r.length} ítem(s) requieren elegir o escribir el lote.`);
            return;
          }
          const E = R.filter((G) => G.revision_estado === 'PENDIENTE');
          if (x && E.length > 0) {
            S.error(`Aún faltan ${E.length} SKU(s) por aprobar o rechazar.`);
            return;
          }
        }
        const z = R.map(({ _key: B, ...r }) => r);
        try {
          if (x) {
            const r = await Zs(x);
            V({
              name:
                (r == null ? void 0 : r.locked_by_name) ||
                (t == null ? void 0 : t.nombre) ||
                'Usuario actual',
              at: (r == null ? void 0 : r.locked_at) || new Date().toISOString()
            });
          }
          let B = u ? s.id : null;
          if (u) {
            const r = { bodega: T || null, periodicidad: h, estado: i, observaciones: L || null };
            (await b.mutateAsync({ informeId: s.id, cabecera: r, items: z }),
              S.success('Informe actualizado'));
          } else {
            const r = {
                fecha: new Date().toISOString().slice(0, 10),
                analista_id: (t == null ? void 0 : t.id) || null,
                analista_nombre: (t == null ? void 0 : t.nombre) || null,
                bodega: T || null,
                periodicidad: h,
                estado: i,
                observaciones: L || null
              },
              E = await C.mutateAsync({
                cabecera: r,
                items: z,
                asignacionId: i === 'ENVIADO_CALIDAD' ? x : null
              });
            ((B = (E == null ? void 0 : E.id) || null),
              S.success(
                i === 'ENVIADO_CALIDAD' ? 'Informe enviado a Calidad' : 'Borrador guardado'
              ),
              x &&
                (E == null ? void 0 : E.asignacion_estado) === 'RESUELTA' &&
                S.success('Asignación de estancia resuelta'));
          }
          if (i === 'ENVIADO_CALIDAD' && B)
            try {
              const r = await it(B);
              ((r == null ? void 0 : r.flags) > 0 &&
                (f.invalidateQueries({ queryKey: ['calidad_flags'] }),
                S.info(`${r.flags} ubicación(es) marcadas "En Auditoría"`)),
                (r == null ? void 0 : r.alertas) > 0 &&
                  (S.warning(`${r.alertas} alerta(s) a Inventario por SKU no registrado`),
                  ct(r.alertas, B)));
            } catch (r) {
              console.error('preliminar', r);
            }
          j();
        } catch (B) {
          S.error(`Error al guardar: ${B.message}`);
        }
      },
      H = R.filter((i) => !(i.ubicacion || '').trim()).length,
      se = R.filter((i) => i.revision_estado !== 'PENDIENTE').length,
      ae = R.length > 0 ? Math.round((se / R.length) * 100) : 0,
      xe = (i, z) =>
        z
          ? i === 'OK'
            ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
            : 'bg-amber-100 text-amber-800 border-amber-300'
          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100',
      ie = C.isPending || b.isPending;
    return ee.status === 'conflict'
      ? e.jsxs('div', {
          className: 'space-y-4',
          children: [
            e.jsxs('button', {
              onClick: k,
              className:
                'flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700',
              children: [e.jsx(Se, { size: 17 }), ' Volver a las tareas']
            }),
            e.jsxs('div', {
              className: 'rounded-2xl border border-rose-300 bg-rose-50 p-6 text-rose-900',
              children: [
                e.jsx('h2', { className: 'text-lg font-black', children: 'Edición bloqueada' }),
                e.jsx('p', { className: 'mt-2 text-sm font-bold', children: ee.error }),
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
                  onClick: k,
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
              g &&
              e.jsxs('div', {
                className:
                  'sticky top-2 z-20 rounded-2xl border border-emerald-200 bg-emerald-50/95 px-4 py-3 shadow-sm backdrop-blur flex flex-wrap items-center justify-between gap-2',
                children: [
                  e.jsxs('p', {
                    className: 'text-sm font-black text-emerald-800',
                    children: [
                      '🔒 Tarea en proceso por: ',
                      g.name,
                      ' - Desde:',
                      ' ',
                      new Date(g.at).toLocaleTimeString('es-CL', {
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
                        children: [se, '/', R.length, ' SKUs · ', ae, '%']
                      })
                    ]
                  }),
                  e.jsx('div', {
                    className: 'h-2.5 overflow-hidden rounded-full bg-slate-100',
                    children: e.jsx('div', {
                      className: 'h-full rounded-full bg-emerald-500 transition-all duration-300',
                      style: { width: `${ae}%` }
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
                      value: T,
                      onChange: (i) => _(i.target.value),
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
                      value: h,
                      onChange: (i) => $(i.target.value),
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
                      value: L,
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
                          value: D,
                          onChange: (i) => y(i.target.value),
                          onKeyDown: (i) => i.key === 'Enter' && U(),
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
                      onClick: U,
                      disabled: p,
                      className:
                        'px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700 disabled:opacity-50',
                      children: [
                        p
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
                    children: m.map((i, z) =>
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
                              onClick: () => J(i),
                              className:
                                'ml-3 p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shrink-0',
                              children: e.jsx(Ee, { size: 16 })
                            })
                          ]
                        },
                        z
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
                      children: ['Ítems del informe (', R.length, ')']
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
                              W
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
                R.length > 0 &&
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
                            checked: Q.length === R.length,
                            onChange: we,
                            className: 'h-4 w-4 rounded border-slate-300 accent-emerald-600'
                          }),
                          'Seleccionar todos (',
                          Q.length,
                          '/',
                          R.length,
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
                W &&
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
                                value: W.codigo,
                                onChange: (i) =>
                                  F((z) => ({ ...z, codigo: i.target.value.toUpperCase() })),
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
                                value: W.ubicacion,
                                onChange: (i) =>
                                  F((z) => ({ ...z, ubicacion: i.target.value.toUpperCase() })),
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
                                value: W.partida,
                                onChange: (i) =>
                                  F((z) => ({ ...z, partida: i.target.value.toUpperCase() })),
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
                                value: W.cantidad,
                                onChange: (i) =>
                                  F((z) => ({ ...z, cantidad: Number(i.target.value) || 0 })),
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
                                value: W.producto,
                                onChange: (i) => F((z) => ({ ...z, producto: i.target.value })),
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
                            onClick: oe,
                            className:
                              'px-4 py-2 rounded-xl bg-amber-600 text-white font-black text-sm hover:bg-amber-700 flex items-center gap-1.5',
                            children: [e.jsx(Ee, { size: 15 }), ' Agregar']
                          })
                        ]
                      })
                    ]
                  }),
                R.length === 0
                  ? e.jsx('p', {
                      className: 'text-sm text-slate-400 py-6 text-center',
                      children: 'Busca y agrega productos al informe.'
                    })
                  : e.jsx('div', {
                      className: 'space-y-3',
                      children: R.map((i) => {
                        const z = i.condicion_observada !== 'OK',
                          B = !(i.ubicacion || '').trim();
                        return e.jsxs(
                          'div',
                          {
                            className: `rounded-xl border p-4 ${z ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`,
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
                                        checked: Q.includes(i._key),
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
                                    children: e.jsx(Pt, { item: i, onChange: (r) => de(i._key, r) })
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
                                          X(i._key, 'ubicacion', r.target.value.toUpperCase()),
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
                                          X(i._key, 'cantidad', Number(r.target.value) || 0),
                                        className:
                                          'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400'
                                      })
                                    ]
                                  }),
                                  z &&
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
                                            X(
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
                                    children: Ya.map((r) =>
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
                                  onChange: (r) => X(i._key, 'observaciones', r.target.value),
                                  placeholder: 'Nota / observación',
                                  className:
                                    'flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400'
                                })
                              }),
                              z &&
                                !B &&
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
                        onClick: () => I(u ? s.estado : 'BORRADOR'),
                        disabled: ie,
                        className:
                          'px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 disabled:opacity-50',
                        children: u ? 'Guardar cambios' : 'Guardar borrador'
                      }),
                    !u &&
                      e.jsxs('button', {
                        onClick: () => I('ENVIADO_CALIDAD'),
                        disabled: ie,
                        className:
                          'px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50',
                        children: [
                          ie
                            ? e.jsx(ce, { size: 16, className: 'animate-spin' })
                            : e.jsx(Bs, { size: 16 }),
                          ' Enviar a Calidad'
                        ]
                      })
                  ]
                }),
                x &&
                  e.jsx('div', {
                    className: `mt-4 text-right text-xs font-bold ${ee.status === 'error' ? 'text-rose-600' : 'text-slate-500'}`,
                    children:
                      ee.status === 'saving' || ee.status === 'pending'
                        ? '⏳ Guardando...'
                        : ee.status === 'error'
                          ? `🔴 No se pudo autoguardar: ${ee.error}`
                          : ee.savedAt
                            ? `🟢 Todos los cambios guardados - ${new Date(ee.savedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
                            : 'Autoguardado listo'
                  })
              ]
            })
          ]
        });
  },
  Ds = {
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
  Is = ({ informe: s, prefill: d, onCancel: l, onSaved: c }) => {
    var q;
    const { user: A } = ve(),
      j = Xa(),
      { data: t } = bs((s == null ? void 0 : s.id) || null),
      f =
        !s && d
          ? {
              antecedentes: `Recepción ${d.oc || 's/OC'} de ${d.proveedor || 's/proveedor'} (${d.origen === 'NACIONAL' ? 'Nacional' : 'Importación'}) resultó NO CONFORME en el CheckList de ingreso. Se levanta el presente Informe de Daños / Solicitud de No Conformidad al proveedor.`,
              fecha_recepcion: d.fecha_recepcion || Ds.fecha_recepcion
            }
          : {},
      [u, C] = v.useState((s == null ? void 0 : s.id) || null),
      [b, O] = v.useState((s == null ? void 0 : s.numero) || ''),
      [x, T] = v.useState((s == null ? void 0 : s.bodega) || ''),
      [_, h] = v.useState((s == null ? void 0 : s.estado) || 'BORRADOR'),
      [$, L] = v.useState({
        ...Ds,
        ...((s == null ? void 0 : s.reporte) || {}),
        ...f,
        elaborado_por:
          ((q = s == null ? void 0 : s.reporte) == null ? void 0 : q.elaborado_por) ||
          (A == null ? void 0 : A.nombre) ||
          ''
      }),
      [M, D] = v.useState([]),
      { data: y = [], refetch: o } = et(u),
      a = v.useRef(!1);
    v.useEffect(() => {
      s != null &&
        s.id &&
        t &&
        !a.current &&
        ((a.current = !0),
        D(
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
    const m = (w, U) => L((J) => ({ ...J, [w]: U })),
      n = () =>
        D((w) => [
          ...w,
          {
            _key: `tmp-${Tt()}`,
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
      p = (w, U, J) => D((oe) => oe.map((X) => (X._key === w ? { ...X, [U]: J } : X))),
      N = (w) => D((U) => U.filter((J) => J._key !== w)),
      R = () =>
        L((w) => ({
          ...w,
          cuadro_resumen: [...(w.cuadro_resumen || []), { indicador: '', valor: '' }]
        })),
      Y = (w, U, J) =>
        L((oe) => ({
          ...oe,
          cuadro_resumen: oe.cuadro_resumen.map((X, de) => (de === w ? { ...X, [U]: J } : X))
        })),
      W = (w) => L((U) => ({ ...U, cuadro_resumen: U.cuadro_resumen.filter((J, oe) => oe !== w) })),
      F = () =>
        L((w) => ({ ...w, acciones_recomendadas: [...(w.acciones_recomendadas || []), ''] })),
      Q = (w, U) =>
        L((J) => ({
          ...J,
          acciones_recomendadas: J.acciones_recomendadas.map((oe, X) => (X === w ? U : oe))
        })),
      Z = (w) =>
        L((U) => ({
          ...U,
          acciones_recomendadas: U.acciones_recomendadas.filter((J, oe) => oe !== w)
        })),
      te = async (w) => {
        const U = w || _;
        try {
          const J = u
              ? {
                  bodega: x || null,
                  periodicidad: 'ADHOC',
                  estado: U,
                  observaciones: $.descripcion_hallazgo || null
                }
              : {
                  fecha: new Date().toISOString().slice(0, 10),
                  analista_id: (A == null ? void 0 : A.id) || null,
                  analista_nombre: (A == null ? void 0 : A.nombre) || null,
                  bodega: x || null,
                  periodicidad: 'ADHOC',
                  estado: U,
                  observaciones: $.descripcion_hallazgo || null
                },
            oe = M.map(({ _key: de, ..._e }) => _e),
            X = await j.mutateAsync({ informeId: u, cabecera: J, reporte: $, hallazgos: oe });
          (C(X.id),
            X.numero && O(X.numero),
            h(U),
            D(X.hallazgos.map((de) => ({ ...de, _key: de.id }))),
            o(),
            S.success('Informe de daños guardado'));
        } catch (J) {
          S.error(`Error al guardar: ${J.message}`);
        }
      },
      ne = {
        id: u,
        numero: b,
        fecha: (s == null ? void 0 : s.fecha) || $.fecha_recepcion,
        bodega: x,
        analista_nombre: $.elaborado_por || (A == null ? void 0 : A.nombre),
        reporte: $
      },
      ee = async (w) => {
        if (!u) {
          S.error('Guarda el informe antes de exportar');
          return;
        }
        try {
          w === 'word' ? await Nt(ne, M, y) : await jt(ne, M, y);
        } catch (U) {
          S.error(`Error al exportar: ${U.message}`);
        }
      },
      P =
        'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-400',
      g = 'text-[10px] font-black text-slate-400 uppercase tracking-widest',
      V = (w) => y.filter((U) => U.item_id === w);
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
                  children: u ? `Informe de Daños ${b}` : 'Nuevo Informe de Daños'
                })
              ]
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-2',
              children: [
                e.jsxs('button', {
                  onClick: () => ee('word'),
                  disabled: !u,
                  className:
                    'px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-blue-700 disabled:opacity-40',
                  children: [e.jsx(Re, { size: 16 }), ' Word']
                }),
                e.jsxs('button', {
                  onClick: () => ee('pdf'),
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
                e.jsx('label', { className: g, children: 'Fecha de recepción' }),
                e.jsx('input', {
                  type: 'date',
                  value: $.fecha_recepcion || '',
                  onChange: (w) => m('fecha_recepcion', w.target.value),
                  className: P
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: g, children: 'Tipo de producto' }),
                e.jsx('input', {
                  value: $.tipo_producto,
                  onChange: (w) => m('tipo_producto', w.target.value),
                  placeholder: 'Ej. Biombos (divisores modulares)',
                  className: P
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: g, children: 'Área responsable' }),
                e.jsx('input', {
                  value: $.area_responsable,
                  onChange: (w) => m('area_responsable', w.target.value),
                  className: P
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: g, children: 'Clasificación' }),
                e.jsx('select', {
                  value: $.clasificacion,
                  onChange: (w) => m('clasificacion', w.target.value),
                  className: P,
                  children: Qs.map((w) => e.jsx('option', { value: w, children: w }, w))
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: g, children: 'Bodega' }),
                e.jsx('input', {
                  value: x,
                  onChange: (w) => T(w.target.value),
                  placeholder: 'Ej. BD 21',
                  className: P
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
                e.jsx('label', { className: g, children: '1. Antecedentes' }),
                e.jsx('textarea', {
                  rows: 3,
                  value: $.antecedentes,
                  onChange: (w) => m('antecedentes', w.target.value),
                  className: P
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: g, children: '2. Descripción del hallazgo' }),
                e.jsx('textarea', {
                  rows: 3,
                  value: $.descripcion_hallazgo,
                  onChange: (w) => m('descripcion_hallazgo', w.target.value),
                  className: P
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
                  children: M.map((w, U) =>
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
                                onClick: () => N(w._key),
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
                                  e.jsx('label', { className: g, children: 'Tipo de daño' }),
                                  e.jsx('input', {
                                    value: w.tipo_dano,
                                    onChange: (J) => p(w._key, 'tipo_dano', J.target.value),
                                    placeholder: 'Deformación por aplastamiento',
                                    className: P
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', { className: g, children: 'Componente afectado' }),
                                  e.jsx('input', {
                                    value: w.componente_afectado,
                                    onChange: (J) =>
                                      p(w._key, 'componente_afectado', J.target.value),
                                    placeholder: 'Pilar / Panel',
                                    className: P
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', { className: g, children: 'Cantidad afectada' }),
                                  e.jsx('input', {
                                    type: 'number',
                                    value: w.cantidad,
                                    onChange: (J) => p(w._key, 'cantidad', J.target.value),
                                    className: P
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', {
                                    className: g,
                                    children: 'Producto / SKU (opcional)'
                                  }),
                                  e.jsx('input', {
                                    value: w.codigo_producto,
                                    onChange: (J) => p(w._key, 'codigo_producto', J.target.value),
                                    placeholder: 'SKU',
                                    className: P
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', {
                                    className: g,
                                    children: 'Ubicación (opcional)'
                                  }),
                                  e.jsx('input', {
                                    value: w.ubicacion,
                                    onChange: (J) => p(w._key, 'ubicacion', J.target.value),
                                    className: P
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx('label', { className: g, children: 'Lote (opcional)' }),
                                  e.jsx('input', {
                                    value: w.partida,
                                    onChange: (J) => p(w._key, 'partida', J.target.value),
                                    className: P
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'sm:col-span-3',
                                children: [
                                  e.jsx('label', { className: g, children: 'Consecuencia' }),
                                  e.jsx('input', {
                                    value: w.consecuencia,
                                    onChange: (J) => p(w._key, 'consecuencia', J.target.value),
                                    placeholder: 'No apto para despacho hasta evaluación técnica',
                                    className: P
                                  })
                                ]
                              }),
                              e.jsxs('div', {
                                className: 'sm:col-span-3',
                                children: [
                                  e.jsx('label', { className: g, children: 'Observaciones' }),
                                  e.jsx('input', {
                                    value: w.observaciones,
                                    onChange: (J) => p(w._key, 'observaciones', J.target.value),
                                    className: P
                                  })
                                ]
                              })
                            ]
                          }),
                          e.jsxs('div', {
                            className: 'mt-3',
                            children: [
                              e.jsx('label', { className: g, children: 'Evidencia fotográfica' }),
                              e.jsx('div', {
                                className: 'mt-1.5',
                                children: e.jsx(yt, {
                                  informeId: u,
                                  itemId: w.id,
                                  evidencias: V(w.id),
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
                  onClick: R,
                  className:
                    'px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-slate-700',
                  children: [e.jsx(Ee, { size: 14 }), ' Fila']
                })
              ]
            }),
            e.jsx('div', {
              className: 'space-y-2',
              children: ($.cuadro_resumen || []).map((w, U) =>
                e.jsxs(
                  'div',
                  {
                    className: 'flex gap-2 items-center',
                    children: [
                      e.jsx('input', {
                        value: w.indicador,
                        onChange: (J) => Y(U, 'indicador', J.target.value),
                        placeholder: 'Indicador (ej. Total de bultos recepcionados)',
                        className: `${P} mt-0 flex-1`
                      }),
                      e.jsx('input', {
                        value: w.valor,
                        onChange: (J) => Y(U, 'valor', J.target.value),
                        placeholder: 'Valor',
                        className: `${P} mt-0 w-32`
                      }),
                      e.jsx('button', {
                        onClick: () => W(U),
                        className:
                          'p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50',
                        children: e.jsx(me, { size: 15 })
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
                e.jsx('label', { className: g, children: '5. Análisis y causa probable' }),
                e.jsx('textarea', {
                  rows: 3,
                  value: $.analisis_causa,
                  onChange: (w) => m('analisis_causa', w.target.value),
                  className: P
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsx('label', { className: g, children: '6. Acciones recomendadas' }),
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
                  children: ($.acciones_recomendadas || []).map((w, U) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'flex gap-2 items-center',
                        children: [
                          e.jsx('input', {
                            value: w,
                            onChange: (J) => Q(U, J.target.value),
                            placeholder: 'Acción recomendada',
                            className: `${P} mt-0 flex-1`
                          }),
                          e.jsx('button', {
                            onClick: () => Z(U),
                            className:
                              'p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50',
                            children: e.jsx(me, { size: 15 })
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
                e.jsx('label', { className: g, children: 'Elaborado por' }),
                e.jsx('input', {
                  value: $.elaborado_por,
                  onChange: (w) => m('elaborado_por', w.target.value),
                  className: P
                })
              ]
            }),
            e.jsxs('div', {
              children: [
                e.jsx('label', { className: g, children: 'Revisado por' }),
                e.jsx('input', {
                  value: $.revisado_por,
                  onChange: (w) => m('revisado_por', w.target.value),
                  className: P
                })
              ]
            })
          ]
        }),
        e.jsxs('div', {
          className: 'flex justify-end gap-3',
          children: [
            e.jsxs('button', {
              onClick: () => te('BORRADOR'),
              disabled: j.isPending,
              className:
                'px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2',
              children: [
                j.isPending
                  ? e.jsx(ce, { size: 16, className: 'animate-spin' })
                  : e.jsx(fa, { size: 16 }),
                ' ',
                'Guardar'
              ]
            }),
            e.jsxs('button', {
              onClick: () => te('ENVIADO_CALIDAD'),
              disabled: j.isPending,
              className:
                'px-5 py-2.5 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center gap-2 hover:bg-rose-700 disabled:opacity-50',
              children: [e.jsx(Bs, { size: 16 }), ' Guardar y enviar']
            })
          ]
        })
      ]
    });
  },
  Ft = ({ informe: s, onBack: d, onEdit: l, onDelete: c }) => {
    var y;
    const { hasPermission: A } = ve(),
      j = A('manage_quality'),
      { data: t = [], isLoading: f } = bs(s.id),
      u = st(),
      C = at(),
      { data: b = [] } = tt(),
      { data: O = [] } = ot(),
      x = rt(),
      [T, _] = v.useState({}),
      h = (o, a) => _((m) => ({ ...m, [o]: { ...m[o], ...a } })),
      $ = async (o) => {
        var n;
        const a = T[o.id] || {};
        if (!a.dictamen) {
          S.error('Selecciona un dictamen');
          return;
        }
        const m = Ge.find((p) => p.id === a.dictamen);
        if (m != null && m.mueve && !a.bodegaDestino) {
          S.error('Indica la bodega destino');
          return;
        }
        if (a.tipoAccion) {
          const p = Be.find((N) => N.id === a.tipoAccion);
          if (!(a.area || (p != null && p.area))) {
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
              dt({
                codigo: o.codigo_producto,
                ubicacion: o.ubicacion,
                estadoLabel: (m == null ? void 0 : m.label) || a.dictamen,
                tipo: 'CALIDAD_DICTAMEN'
              }),
            a.tipoAccion)
          ) {
            const p = Be.find((R) => R.id === a.tipoAccion),
              N = a.area || (p == null ? void 0 : p.area);
            if (!N) {
              S.error('Selecciona el área responsable de la acción');
              return;
            }
            try {
              const R = await C.mutateAsync({
                itemId: o.id,
                tipoAccion: a.tipoAccion,
                area: N,
                descripcion: a.descAccion,
                prioridad: a.prioridad || 'NORMAL'
              });
              S.success(
                `Acción promulgada ${(R == null ? void 0 : R.folio) || ''} → ${((n = b.find((Y) => Y.codigo === N)) == null ? void 0 : n.label) || N}`
              );
            } catch (R) {
              S.error(`Dictamen OK, pero no se pudo crear la acción: ${R.message}`);
            }
          }
        } catch (p) {
          S.error(`Error: ${p.message}`);
        }
      },
      L = () => {
        const o = t.map((N) => ({
            SKU: N.codigo_producto,
            Lote_Serie: N.partida,
            Ubicacion: N.ubicacion,
            Producto: N.producto,
            UM: N.unidad_medida,
            Cantidad: N.cantidad,
            Uds_Afectadas: N.cantidad_afectada || 0,
            No_Registrado: N.no_registrado ? 'SÍ' : '',
            Estado_Inv: N.estado_inventario,
            Tipo: N.tipo,
            Vence: N.fecha_vencimiento,
            Semaforo: N.semaforo,
            Condicion: N.condicion_observada,
            Motivo: N.motivo,
            Observaciones: N.observaciones,
            Dictamen: N.dictamen || '',
            Bodega_Destino: N.bodega_destino || '',
            Acuse: N.acuse_texto || '',
            Calidad: N.calidad_nombre || '',
            Fecha_Dictamen: N.fecha_dictamen || ''
          })),
          a = (N) => t.filter(N).length,
          m = ['LIBERAR', 'CUARENTENA', 'REPROCESO', 'RECHAZAR', 'BAJA'],
          n = [...new Set(t.map((N) => N.condicion_observada).filter(Boolean))],
          p = [
            { Campo: 'Informe', Valor: s.numero },
            { Campo: 'Fecha', Valor: s.fecha },
            { Campo: 'Bodega', Valor: s.bodega || '—' },
            { Campo: 'Analista', Valor: s.analista_nombre || '—' },
            { Campo: 'Estado', Valor: s.estado },
            { Campo: 'Total ítems', Valor: t.length },
            { Campo: 'Dictaminados', Valor: a((N) => N.dictamen) },
            { Campo: 'Pendientes', Valor: a((N) => !N.dictamen) },
            {
              Campo: 'Con problema (cond≠OK)',
              Valor: a((N) => N.condicion_observada && N.condicion_observada !== 'OK')
            },
            { Campo: 'No registrados', Valor: a((N) => N.no_registrado) },
            { Campo: '— Por semáforo —', Valor: '' },
            ...['ROJO', 'NARANJA', 'VERDE', 'NA'].map((N) => ({
              Campo: `Semáforo ${N}`,
              Valor: a((R) => R.semaforo === N)
            })),
            { Campo: '— Por dictamen —', Valor: '' },
            ...m.map((N) => ({ Campo: N, Valor: a((R) => R.dictamen === N) })),
            { Campo: '— Por condición —', Valor: '' },
            ...n.map((N) => ({ Campo: N, Valor: a((R) => R.condicion_observada === N) }))
          ];
        _a({
          filename: `Monitoreo_${s.numero}`,
          sheets: [
            { name: 'Resumen', rows: p },
            { name: 'Detalle', rows: o }
          ]
        });
      },
      M = v.useMemo(() => t.filter((o) => !o.dictamen).length, [t]),
      D = v.useMemo(() => {
        const o = t.length,
          a = t.filter((N) => N.dictamen).length,
          m = t.filter((N) => N.no_registrado).length,
          n = t.filter((N) => N.condicion_observada && N.condicion_observada !== 'OK').length,
          p = { ROJO: 0, NARANJA: 0, VERDE: 0, NA: 0 };
        return (
          t.forEach((N) => {
            p[N.semaforo] = (p[N.semaforo] || 0) + 1;
          }),
          {
            total: o,
            dictaminados: a,
            noReg: m,
            conProblema: n,
            sem: p,
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
                          children: (y = s.estado) == null ? void 0 : y.replace('_', ' ')
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
                    children: [e.jsx(Us, { size: 16 }), ' Editar']
                  }),
                c &&
                  e.jsxs('button', {
                    onClick: () => c(s),
                    className:
                      'px-4 py-2.5 bg-white border border-slate-200 text-rose-600 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-rose-50',
                    children: [e.jsx(me, { size: 16 }), ' Eliminar']
                  }),
                e.jsxs('button', {
                  onClick: () => _t(s, t),
                  title: 'Descargar Word',
                  className:
                    'px-3 py-2.5 bg-white border border-slate-200 text-blue-700 rounded-xl text-sm font-black flex items-center gap-1.5 hover:bg-blue-50',
                  children: [e.jsx(Re, { size: 16 }), ' Word']
                }),
                e.jsxs('button', {
                  onClick: () => wt(s, t),
                  title: 'Descargar PDF',
                  className:
                    'px-3 py-2.5 bg-white border border-slate-200 text-rose-700 rounded-xl text-sm font-black flex items-center gap-1.5 hover:bg-rose-50',
                  children: [e.jsx(Gs, { size: 16 }), ' PDF']
                }),
                e.jsxs('button', {
                  onClick: L,
                  className:
                    'px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700',
                  children: [e.jsx(Na, { size: 16 }), ' Excel']
                })
              ]
            })
          ]
        }),
        !f &&
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
                    children: [D.dictaminados, '/', D.total, ' · ', D.pct, '%']
                  })
                ]
              }),
              e.jsx('div', {
                className: 'h-2 bg-slate-100 rounded-full overflow-hidden mb-4',
                children: e.jsx('div', {
                  className: 'h-full bg-emerald-500 transition-all',
                  style: { width: `${D.pct}%` }
                })
              }),
              e.jsx('div', {
                className: 'grid grid-cols-2 sm:grid-cols-5 gap-3',
                children: [
                  { label: 'Ítems', value: D.total, cls: 'text-slate-900' },
                  { label: 'Dictaminados', value: D.dictaminados, cls: 'text-emerald-600' },
                  { label: 'Pendientes', value: M, cls: 'text-amber-600' },
                  { label: 'Con problema', value: D.conProblema, cls: 'text-orange-600' },
                  { label: 'No registrados', value: D.noReg, cls: 'text-rose-600' }
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
                  D.sem.ROJO > 0 &&
                    e.jsxs('span', {
                      className:
                        'text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1',
                      children: [
                        e.jsx('span', { className: 'w-2 h-2 rounded-full bg-rose-500' }),
                        ' ',
                        D.sem.ROJO,
                        ' vence <30d'
                      ]
                    }),
                  D.sem.NARANJA > 0 &&
                    e.jsxs('span', {
                      className:
                        'text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1',
                      children: [
                        e.jsx('span', { className: 'w-2 h-2 rounded-full bg-amber-500' }),
                        ' ',
                        D.sem.NARANJA,
                        ' vence <90d'
                      ]
                    }),
                  D.sem.VERDE > 0 &&
                    e.jsxs('span', {
                      className:
                        'text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1',
                      children: [
                        e.jsx('span', { className: 'w-2 h-2 rounded-full bg-emerald-500' }),
                        ' ',
                        D.sem.VERDE,
                        ' vigente'
                      ]
                    })
                ]
              })
            ]
          }),
        f
          ? e.jsx('div', {
              className: 'flex justify-center py-16',
              children: e.jsx(ce, { className: 'animate-spin text-emerald-500', size: 32 })
            })
          : e.jsx('div', {
              className: 'space-y-3',
              children: t.map((o) => {
                const a = T[o.id] || {},
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
                                  e.jsx(mt, { estado: Mt(o.dictamen) }),
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
                      j &&
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
                                  onChange: (n) => h(o.id, { dictamen: n.target.value }),
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
                                    onChange: (n) => h(o.id, { bodegaDestino: n.target.value }),
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
                                        nt.map((n) =>
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
                                  onChange: (n) => h(o.id, { acuse: n.target.value }),
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
                                    const p = Be.find((N) => N.id === n.target.value);
                                    h(o.id, {
                                      tipoAccion: n.target.value,
                                      area: (p == null ? void 0 : p.area) || a.area
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
                                        onChange: (n) => h(o.id, { area: n.target.value }),
                                        className:
                                          'block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400',
                                        children: [
                                          e.jsx('option', { value: '', children: '— Elegir —' }),
                                          b.map((n) =>
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
                                        onChange: (n) => h(o.id, { prioridad: n.target.value }),
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
                                        onChange: (n) => h(o.id, { descAccion: n.target.value }),
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
                              onClick: () => $(o),
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
        j &&
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
function Mt(s) {
  const d = Ge.find((l) => l.id === s);
  return (d == null ? void 0 : d.estado) || 'LIBERADO';
}
const so = () => {
  const { hasPermission: s, user: d } = ve(),
    l = s('manage_monitoreo') || s('manage_quality'),
    A = (d == null ? void 0 : d.rol) === 'ADMIN' || (d == null ? void 0 : d.es_admin_delegado),
    { data: j = [], isLoading: t } = Ha(),
    f = Va(),
    [u, C] = v.useState('list'),
    [b, O] = v.useState(null),
    [x, T] = v.useState('hito1'),
    [_, h] = v.useState(null),
    [$, L] = v.useState(null),
    [M, D] = v.useState(''),
    y = Ka(),
    o = qa(),
    a = Ja(),
    m = v.useMemo(() => {
      const F = M.trim().toLocaleLowerCase('es-CL');
      return F
        ? j.filter((Q) =>
            [
              Q.numero,
              Q.bodega,
              Q.analista_nombre,
              Q.estado,
              Q.tipo_informe,
              JSON.stringify(Q.reporte || {})
            ].some((Z) =>
              String(Z || '')
                .toLocaleLowerCase('es-CL')
                .includes(F)
            )
          )
        : j;
    }, [M, j]);
  (Es('tms_calidad_tareas', ['calidad_tareas'], { debounceMs: 400 }),
    Es('tms_calidad_asignaciones', ['calidad_asignaciones'], { debounceMs: 400 }),
    v.useEffect(() => {
      if (u === 'detail' && b) {
        const F = j.find((Q) => Q.id === b.id);
        F && O(F);
      }
    }, [j]));
  const n = (F) => {
      (O(F), C(F.tipo_informe === 'DANOS' && l ? 'edit-danos' : 'detail'));
    },
    p = (F) => {
      (O(F), C(F.tipo_informe === 'DANOS' ? 'edit-danos' : 'edit'));
    },
    N = async (F) => {
      if (confirm(`¿Eliminar el informe ${F.numero}? Esta acción no se puede deshacer.`))
        try {
          (await f.mutateAsync(F.id),
            S.success('Informe eliminado'),
            (b == null ? void 0 : b.id) === F.id && (O(null), C('list')));
        } catch (Q) {
          S.error(`No se pudo eliminar: ${Q.message}`);
        }
    },
    R = () => {
      (C('list'), O(null), h(null), L(null));
    },
    Y = (F) => {
      (O(null),
        h({
          proveedor: F.proveedor,
          oc: F.oc,
          origen: F.origen,
          fecha_recepcion: F.fecha_recepcion,
          recepcion_id: F.recepcion_id,
          tarea_id: F.id
        }),
        T('hito2'),
        C('new-danos'));
    },
    W = async (F) => {
      try {
        const Q = await Zs(F.id);
        (O(null), L({ ...F, ...Q }), T('hito2'), C('new'));
      } catch (Q) {
        S.error((Q == null ? void 0 : Q.message) || 'No se pudo abrir la tarea de Calidad');
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
            { id: 'hito1', n: 1, label: 'Recepción', sub: 'Ingreso a bodega', icon: ga, badge: y },
            {
              id: 'hito2',
              n: 2,
              label: 'Estancia',
              sub: 'Producto en almacenamiento',
              icon: Ms,
              badge: o
            },
            { id: 'hito3', n: 3, label: 'Salida', sub: 'Despacho', icon: Je, badge: a }
          ].map((F) => {
            const Q = F.icon,
              Z = x === F.id;
            return e.jsxs(
              'button',
              {
                onClick: () => T(F.id),
                className: `px-4 py-2.5 rounded-xl font-black text-sm border transition-colors flex items-center gap-2.5 ${Z ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`,
                children: [
                  e.jsx('span', {
                    className: `w-6 h-6 rounded-lg flex items-center justify-center text-[11px] ${Z ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`,
                    children: F.n
                  }),
                  e.jsx(Q, { size: 16, className: 'shrink-0' }),
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
      u === 'list' && x === 'hito1' && e.jsx(Ot, { onGenerarDanos: Y }),
      u === 'list' && x === 'hito3' && e.jsx(zt, {}),
      u === 'new' &&
        e.jsx(Rs, {
          prefillItems: $ == null ? void 0 : $.skus,
          asignacion: $,
          onCancel: R,
          onSaved: R
        }),
      u === 'edit' && b && e.jsx(Rs, { informe: b, onCancel: R, onSaved: R }),
      u === 'new-danos' && e.jsx(Is, { prefill: _, onCancel: R, onSaved: R }),
      u === 'edit-danos' && b && e.jsx(Is, { informe: b, onCancel: R, onSaved: R }),
      u === 'detail' &&
        b &&
        e.jsx(Ft, { informe: b, onBack: R, onEdit: l ? p : null, onDelete: l ? N : null }),
      u === 'list' &&
        x === 'hito2' &&
        e.jsx(Rt, { canAssign: A, canManageQuality: l, onGenerarInforme: W }),
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
                            e.jsx(Cs, { size: 16, className: 'text-emerald-500' }),
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
                        children: [m.length, ' / ', j.length]
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
                      onChange: (F) => D(F.target.value),
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
              : j.length === 0
                ? e.jsxs('div', {
                    className: 'flex flex-col items-center justify-center py-16 text-center',
                    children: [
                      e.jsx(Cs, { size: 44, className: 'text-slate-200 mb-4' }),
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
                          onClick: () => D(''),
                          className: 'mt-2 text-xs font-black text-sky-600 hover:text-sky-700',
                          children: 'Limpiar búsqueda'
                        })
                      ]
                    })
                  : e.jsx('div', {
                      className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
                      children: m.map((F) => {
                        var Z;
                        const Q = F.tipo_informe === 'DANOS';
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
                                      className: `text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${Os[F.tipo_informe] || Os.MONITOREO}`,
                                      children: Q ? 'Daños' : 'Monitoreo'
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
                                      onClick: () => p(F),
                                      className:
                                        'flex-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-black flex items-center justify-center gap-1.5 hover:bg-slate-50',
                                      children: [e.jsx(Us, { size: 14 }), ' Editar']
                                    }),
                                    e.jsxs('button', {
                                      onClick: () => N(F),
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
export { so as default };
