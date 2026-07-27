// ── Inventario → Carteles de Bodega ─────────────────────────────────────────
// Port del Excel "CARTELES PTM": imprime carteles de producto (código gigante +
// descripción + código de barras CODE128) en tres formatos de página:
// ÚNICO (1 por hoja) · DOBLE (2) · CUÁDRUPLE (4). La "tabla de códigos" (hoja
// BD del Excel) ES la tabla maestra existente de CCO (tms_matriz_codigos): se
// busca ahí y la descripción llega sola — se acabaron los VLOOKUP con #REF!.
import { useEffect, useMemo, useState } from 'react';
import {
  Printer,
  Search,
  Plus,
  Trash2,
  Minus,
  LayoutGrid,
  Square,
  Columns,
  Eraser
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../supabase';
// Generador CODE128 propio (src/lib/code128.js): en el Excel los códigos de
// barra eran imágenes pegadas a mano; aquí se generan desde el código. El SVG
// solo contiene <rect> calculados localmente (sin datos externos en el markup).
import { code128Svg } from '../../lib/code128';

const FORMATOS = [
  { id: 1, label: 'Único', desc: '1 por hoja', icon: Square },
  { id: 2, label: 'Doble', desc: '2 por hoja', icon: Columns },
  { id: 4, label: 'Cuádruple', desc: '4 por hoja', icon: LayoutGrid }
];

// Tamaños tipográficos por formato (herederos de los del Excel: 36/44 doble, 30/28 cuádruple).
// Tamaños tipográficos por formato (herederos de los del Excel).
// barMaxH limita el ALTO del código de barras: al llenar el 100% del ancho, en
// las celdas anchas (Doble/Único) el barcode salía altísimo y empujaba el logo
// fuera de la celda. El tope lo mantiene proporcionado.
const SIZES = {
  1: {
    label: '22pt',
    desc: '34pt',
    barH: 120,
    pad: '18mm',
    logo: '20mm',
    codeMax: '40mm',
    barMaxH: '32mm'
  },
  2: {
    label: '15pt',
    desc: '24pt',
    barH: 90,
    pad: '9mm',
    logo: '13mm',
    codeMax: '24mm',
    barMaxH: '22mm'
  },
  4: {
    label: '11pt',
    desc: '16pt',
    barH: 64,
    pad: '6mm',
    logo: '9mm',
    codeMax: '16mm',
    barMaxH: '18mm'
  }
};

// Código en UNA sola línea, siempre. En vez de un font-size fijo (que parte los
// códigos largos en dos líneas), se dibuja como texto SVG que se escala al ancho
// del contenedor: `textLength` fuerza a que ocupe todo el ancho sin cortar, y el
// alto se limita con `maxHeight` para que los códigos cortos no queden gigantes.
function CodigoFit({ text, maxHeight }) {
  const t = String(text ?? '').trim();
  const w = Math.max(1, t.length) * 0.62; // ancho de viewBox ≈ avance por carácter (monoespaciado)
  return (
    <svg
      viewBox={`0 0 ${w} 1`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', width: '100%', height: 'auto', maxHeight }}
    >
      <text
        x={w / 2}
        y="0.74"
        textAnchor="middle"
        textLength={w * 0.98}
        lengthAdjust="spacingAndGlyphs"
        fontFamily="'Courier New', ui-monospace, monospace"
        fontWeight="900"
        fontSize="0.86"
        fill="#000"
      >
        {t}
      </text>
    </svg>
  );
}

export default function Carteles() {
  const [q, setQ] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [cola, setCola] = useState([]); // [{codigo, producto, um, copias}]
  const [formato, setFormato] = useState(4);

  // Búsqueda con debounce sobre la tabla maestra de códigos (tms_matriz_codigos).
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    const t = setTimeout(async () => {
      const pat = `%${term.replace(/[%_]/g, '')}%`;
      const { data, error } = await supabase
        .from('tms_matriz_codigos')
        .select('codigo_producto, producto, unidad_medida')
        .or(`codigo_producto.ilike.${pat},producto.ilike.${pat}`)
        .order('codigo_producto')
        .limit(30);
      if (!error) setResultados(data || []);
      setBuscando(false);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const agregar = (r) => {
    setCola((c) => {
      if (c.some((x) => x.codigo === r.codigo_producto)) {
        toast.info(`${r.codigo_producto} ya está en la cola`);
        return c;
      }
      return [
        ...c,
        {
          codigo: String(r.codigo_producto || '').trim(),
          producto: r.producto || '',
          um: r.unidad_medida || '',
          copias: 1
        }
      ];
    });
  };
  const agregarManual = () => {
    const codigo = (window.prompt('Código del producto (no está en la tabla maestra):') || '')
      .trim()
      .toUpperCase();
    if (!codigo) return;
    const producto = (window.prompt('Descripción a imprimir:') || '').trim();
    setCola((c) =>
      c.some((x) => x.codigo === codigo) ? c : [...c, { codigo, producto, um: '', copias: 1 }]
    );
  };
  const copias = (codigo, delta) =>
    setCola((c) =>
      c.map((x) =>
        x.codigo === codigo ? { ...x, copias: Math.max(1, Math.min(99, x.copias + delta)) } : x
      )
    );
  const quitar = (codigo) => setCola((c) => c.filter((x) => x.codigo !== codigo));

  // Expandir copias y agrupar en páginas según el formato.
  const paginas = useMemo(() => {
    const items = cola.flatMap((x) => Array.from({ length: x.copias }, () => x));
    const pags = [];
    for (let i = 0; i < items.length; i += formato) pags.push(items.slice(i, i + formato));
    return pags;
  }, [cola, formato]);

  const imprimir = () => {
    if (!paginas.length) {
      toast.error('Agrega al menos un producto a la cola');
      return;
    }
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 space-y-4 sm:space-y-6 text-slate-700">
      {/* Estilos de impresión: solo se imprime el área de carteles, una página por grupo */}
      <style>{`
        @page { size: A4 portrait; margin: 8mm; }
        @media print {
          body * { visibility: hidden !important; }
          #carteles-print, #carteles-print * { visibility: visible !important; }
          /* Imprimir el logo/colores tal cual (no descartar fondos/tintas). */
          #carteles-print, #carteles-print * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          #carteles-print { position: absolute; left: 0; top: 0; width: 100%; }
          .cartel-page { page-break-after: always; height: 273mm; border: none !important; box-shadow: none !important; }
          .cartel-cell { border: 1.2pt dashed #94a3b8 !important; }
        }
      `}</style>

      {/* Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
            <Printer size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Carteles de <span className="text-orange-600">Bodega</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Código + descripción + código de barras · conectado a la tabla maestra de códigos
            </p>
          </div>
        </div>
        <button
          onClick={imprimir}
          disabled={!paginas.length}
          className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-slate-700 disabled:opacity-40 inline-flex items-center gap-2"
        >
          <Printer size={17} /> Imprimir {paginas.length ? `(${paginas.length} pág.)` : ''}
        </button>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-4 print:block">
        {/* Panel izquierdo: búsqueda + cola + formato */}
        <div className="space-y-4 print:hidden">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="font-black text-slate-900 text-sm">
              1 · Buscar en la tabla de códigos
            </div>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Código o descripción…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {buscando && <div className="text-xs text-slate-400 py-2 text-center">Buscando…</div>}
              {!buscando && q.trim().length >= 2 && !resultados.length && (
                <div className="text-xs text-slate-400 py-2 text-center">
                  Sin resultados en la tabla maestra.
                </div>
              )}
              {resultados.map((r) => (
                <button
                  key={r.codigo_producto}
                  onClick={() => agregar(r)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-orange-50 border border-transparent hover:border-orange-200 group"
                >
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {r.codigo_producto}
                  </span>
                  <span className="block text-[11px] text-slate-500 truncate">
                    {r.producto || '—'}
                  </span>
                  <span className="hidden group-hover:inline-flex items-center gap-1 text-[10px] font-black text-orange-600">
                    <Plus size={11} /> Agregar
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={agregarManual}
              className="w-full px-3 py-2 rounded-xl border border-dashed border-slate-300 text-xs font-bold text-slate-500 hover:border-orange-400 hover:text-orange-600 inline-flex items-center justify-center gap-1.5"
            >
              <Plus size={13} /> Agregar código manual (no está en la tabla)
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="font-black text-slate-900 text-sm">2 · Formato de impresión</div>
            <div className="grid grid-cols-3 gap-2">
              {FORMATOS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormato(f.id)}
                  className={`rounded-xl border p-3 text-center transition-all ${formato === f.id ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'border-slate-200 text-slate-600 hover:border-orange-300'}`}
                >
                  <f.icon size={18} className="mx-auto mb-1" />
                  <div className="text-xs font-black">{f.label}</div>
                  <div
                    className={`text-[10px] font-bold ${formato === f.id ? 'text-orange-100' : 'text-slate-400'}`}
                  >
                    {f.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-black text-slate-900 text-sm">
                3 · Cola de impresión ({cola.length})
              </div>
              {cola.length > 0 && (
                <button
                  onClick={() => setCola([])}
                  className="text-[11px] font-black text-rose-500 hover:text-rose-700 inline-flex items-center gap-1"
                >
                  <Eraser size={12} /> Vaciar
                </button>
              )}
            </div>
            {!cola.length && (
              <div className="text-xs text-slate-400 py-3 text-center">
                Busca y agrega productos para armar los carteles.
              </div>
            )}
            {cola.map((x) => (
              <div
                key={x.codigo}
                className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono font-bold text-xs text-slate-800">{x.codigo}</div>
                  <div className="text-[11px] text-slate-500 truncate">{x.producto || '—'}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copias(x.codigo, -1)}
                    className="p-1 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="text-xs font-black w-6 text-center">{x.copias}</span>
                  <button
                    onClick={() => copias(x.codigo, 1)}
                    className="p-1 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
                  >
                    <Plus size={11} />
                  </button>
                </div>
                <button
                  onClick={() => quitar(x.codigo)}
                  className="p-1.5 rounded-md text-rose-400 hover:bg-rose-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Vista previa / área de impresión */}
        <div id="carteles-print" className="space-y-4">
          {!paginas.length && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 text-slate-300 text-center py-24 font-bold print:hidden">
              La vista previa de los carteles aparecerá aquí.
            </div>
          )}
          {paginas.map((pag, i) => (
            <Pagina key={i} items={pag} formato={formato} numero={i + 1} total={paginas.length} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Cartel({ item, formato }) {
  const s = SIZES[formato];
  const svg = code128Svg(item.codigo, { height: s.barH, cssHeight: s.barMaxH });
  // Único (1 por hoja): centrado (se ve bien). Doble/Cuádruple: contenido anclado
  // ARRIBA para que el logo nunca se recorte si el contenido roza el alto de la celda.
  const alinear = formato === 1 ? 'justify-center' : 'justify-start';
  return (
    <div
      className={`cartel-cell flex flex-col items-center ${alinear} text-center border border-dashed border-slate-300 rounded-lg overflow-hidden`}
      style={{ padding: s.pad, breakInside: 'avoid' }}
    >
      <img
        src="/logo-ptm.png"
        alt="PTM Health Care"
        className="object-contain mb-2"
        style={{ height: s.logo, width: 'auto' }}
      />
      <div
        className="font-black tracking-[0.25em] text-slate-500 uppercase"
        style={{ fontSize: s.label }}
      >
        Código Producto
      </div>
      {/* Código en UNA sola línea, auto-escalado al ancho (corrección conservada). */}
      <div className="w-full px-1">
        <CodigoFit text={item.codigo} maxHeight={s.codeMax} />
      </div>
      <div className="font-black text-black leading-tight mt-1" style={{ fontSize: s.desc }}>
        {item.producto || 'SI TE APARECE ESTO ES PORQUE NO ESTÁ EN LA TABLA DE CÓDIGOS'}
      </div>
      <div
        className="font-black tracking-[0.25em] text-slate-500 uppercase mt-2"
        style={{ fontSize: s.label }}
      >
        Código Barra
      </div>
      {/* Barcode legible: llena el ancho y nítido (corrección conservada). */}
      {svg ? (
        <div className="w-full mt-1 px-1" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="text-rose-500 text-xs font-bold mt-1">
          Código no representable en CODE128
        </div>
      )}
      <div className="font-mono font-bold text-black mt-0.5" style={{ fontSize: s.label }}>
        {item.codigo}
      </div>
    </div>
  );
}

function Pagina({ items, formato, numero, total }) {
  const grid =
    formato === 1
      ? 'grid-cols-1 grid-rows-1'
      : formato === 2
        ? 'grid-cols-1 grid-rows-2'
        : 'grid-cols-2 grid-rows-2';
  return (
    <div
      className="cartel-page bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
      style={{ minHeight: '273mm' }}
    >
      <div className={`grid ${grid} gap-3 h-full`} style={{ minHeight: '260mm' }}>
        {items.map((it, i) => (
          <Cartel key={`${it.codigo}-${i}`} item={it} formato={formato} />
        ))}
        {/* celdas vacías para completar la grilla (mantiene el tamaño de cada cartel) */}
        {Array.from({ length: formato - items.length }, (_, i) => (
          <div
            key={`v-${i}`}
            className="cartel-cell border border-dashed border-slate-200 rounded-lg"
          />
        ))}
      </div>
      <div className="text-right text-[10px] text-slate-300 font-bold pt-1 print:hidden">
        Página {numero} / {total}
      </div>
    </div>
  );
}
