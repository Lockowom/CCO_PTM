import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { supabase } from '../../supabase';
import { logUpload } from '../../utils/logUpload';
import { classifyPutawayRow, normalizePutawayLocation, parsePutawaySheetRows } from '../../lib/putawayBulk';

const LOOKUP_CHUNK_SIZE = 400;
const WRITE_CHUNK_SIZE = 500;

const chunk = (items, size) => {
  const result = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
};

const parseFile = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) throw new Error('El archivo no contiene una hoja para importar.');
  const sheetRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '', raw: false });
  return parsePutawaySheetRows(sheetRows);
};

async function resolveRows(rawRows) {
  const codes = [...new Set(rawRows.map((row) => String(row.codigo || '').trim().toUpperCase()).filter(Boolean))];
  const skuByCode = new Map();
  const activeLocations = new Set();

  await Promise.all(
    chunk(codes, LOOKUP_CHUNK_SIZE).map(async (codesChunk) => {
      const { data, error } = await supabase
        .from('tms_matriz_codigos')
        .select('codigo_producto, producto')
        .in('codigo_producto', codesChunk);
      if (error) throw error;
      (data || []).forEach((row) => skuByCode.set(String(row.codigo_producto).trim().toUpperCase(), row));
    })
  );

  // Esta consulta usa el formato canónico (E-8-1 -> E-08-01) antes de enviar
  // cualquier escritura al RPC de Put Away.
  const normalizedCandidates = rawRows.map((row) => ({
    ...row,
    ubicacion: normalizePutawayLocation(row.ubicacion)
  }));
  const normalizedLocations = [
    ...new Set(
      normalizedCandidates
        .map((row) => String(row.ubicacion || '').trim().toUpperCase())
        .filter(Boolean)
    )
  ];
  await Promise.all(
    chunk(normalizedLocations, LOOKUP_CHUNK_SIZE).map(async (locationsChunk) => {
      const { data, error } = await supabase
        .from('wms_ubicaciones_maestras')
        .select('ubicacion')
        .eq('activo', true)
        .in('ubicacion', locationsChunk);
      if (error) throw error;
      (data || []).forEach((row) => activeLocations.add(String(row.ubicacion).trim().toUpperCase()));
    })
  );

  return rawRows.map((raw) => classifyPutawayRow({ raw, ...raw, skuByCode, activeLocations }));
}

const downloadTemplate = () => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['UBICACION', 'CODIGO'],
    ['E-8-1', 'N022350020'],
    ['E-6-3', 'N02301115']
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Put Away');
  XLSX.writeFile(workbook, 'plantilla_putaway_masivo.xlsx');
};

export default function PutawayBulkImport({ onClose, onSaved }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const readyRows = useMemo(() => rows.filter((row) => row.status === 'READY'), [rows]);
  const rejectedRows = useMemo(() => rows.filter((row) => row.status !== 'READY'), [rows]);
  const correctedRows = useMemo(
    () => rows.filter((row) => row.status === 'READY' && row.ubicacion !== String(row.rawUbicacion || '').trim().toUpperCase()).length,
    [rows]
  );

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const parsedRows = await parseFile(file);
      if (!parsedRows.length) throw new Error('El archivo no contiene filas de Put Away.');
      const resolvedRows = await resolveRows(parsedRows);
      const seen = new Set();
      const uniqueRows = resolvedRows.map((row) => {
        if (row.status !== 'READY') return { ...row, rawUbicacion: parsedRows.find((raw) => raw.rowNumber === row.rowNumber)?.ubicacion };
        const key = `${row.ubicacion}\u001f${row.codigo}`;
        if (seen.has(key)) return { ...row, status: 'ERROR', reason: 'Duplicada en el archivo' };
        seen.add(key);
        return { ...row, rawUbicacion: parsedRows.find((raw) => raw.rowNumber === row.rowNumber)?.ubicacion };
      });
      setRows(uniqueRows);
      setFileName(file.name);
      toast.success(`${uniqueRows.filter((row) => row.status === 'READY').length} fila(s) listas para cargar.`);
    } catch (error) {
      setRows([]);
      setFileName('');
      toast.error(error.message || 'No se pudo validar el archivo.');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!readyRows.length) return;
    setSaving(true);
    let saved = 0;
    try {
      for (const batch of chunk(readyRows, WRITE_CHUNK_SIZE)) {
        const { data, error } = await supabase.rpc('registrar_putaway_ubicaciones', {
          p_items: batch.map((row) => ({
            ubicacion: row.ubicacion,
            codigo: row.codigo,
            descripcion: row.descripcion
          }))
        });
        if (error) throw error;
        saved += Number(data?.guardados || 0);
      }
      await logUpload({
        modulo: 'Put Away visual · carga masiva',
        tablaDestino: 'wms_ubicaciones',
        totalRegistros: rows.length,
        nuevos: saved,
        errores: rejectedRows.length
      });
      toast.success(`${saved} SKU(s) registrados visualmente. ${rejectedRows.length} fila(s) quedaron fuera.`);
      onSaved?.();
      onClose();
    } catch (error) {
      toast.error(error.message || 'No se pudo completar la carga masiva. No se reintentó automáticamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="mx-auto my-4 w-full max-w-6xl rounded-3xl bg-slate-50 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-slate-950"><FileSpreadsheet size={22} /> Carga masiva Put Away</h2>
            <p className="mt-1 text-sm text-slate-500">Usa el maestro SKU para completar descripciones y omite errores sin detener las filas correctas.</p>
            <p className="mt-1 text-xs font-bold text-emerald-700">Solo crea ubicación visual: cantidad = 0, sin escritura en stock ni ERP.</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" aria-label="Cerrar"><X size={20} /></button>
        </header>

        <div className="p-5">
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-blue-300 bg-blue-50/50 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <strong className="block text-sm text-slate-800">Archivo Excel o CSV</strong>
              <span className="text-xs text-slate-500">Columnas requeridas: <b>UBICACION</b> y <b>CODIGO</b> o <b>SKU</b>. Ej.: E-8-1 se convierte en E-08-01.</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={downloadTemplate} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"><Download size={15} /> Plantilla</button>
              <button onClick={() => inputRef.current?.click()} disabled={loading || saving} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700 disabled:opacity-50">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} {loading ? 'Validando...' : 'Seleccionar archivo'}
              </button>
              <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
            </div>
          </div>

          {fileName && (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ['Archivo', fileName, 'text-slate-700'],
                  ['Listas para cargar', readyRows.length, 'text-emerald-700'],
                  ['Con error / omitidas', rejectedRows.length, 'text-rose-700'],
                  ['Ubicaciones corregidas', correctedRows, 'text-blue-700']
                ].map(([label, value, tone]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3"><span className="block text-[10px] font-black uppercase text-slate-400">{label}</span><strong className={`mt-1 block truncate text-sm ${tone}`}>{value}</strong></div>)}
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="max-h-[48vh] overflow-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 text-[10px] font-black uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Fila</th><th className="px-3 py-3">Ubicación final</th><th className="px-3 py-3">SKU</th><th className="px-3 py-3">Descripción desde maestro</th><th className="px-3 py-3">Resultado</th></tr></thead>
                    <tbody>{rows.slice(0, 1000).map((row) => <tr key={row.rowNumber} className={`border-t border-slate-100 ${row.status === 'READY' ? '' : 'bg-rose-50/50'}`}><td className="px-3 py-2 text-slate-400">{row.rowNumber}</td><td className="px-3 py-2 font-mono font-bold">{row.ubicacion || '—'}</td><td className="px-3 py-2 font-mono text-blue-700">{row.codigo || '—'}</td><td className="px-3 py-2 text-slate-700">{row.descripcion || '—'}</td><td className={`px-3 py-2 font-bold ${row.status === 'READY' ? 'text-emerald-700' : 'text-rose-700'}`}>{row.status === 'READY' ? 'LISTA' : row.reason}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
              {rows.length > 1000 && <p className="mt-2 text-xs text-slate-400">Vista previa de 1.000 de {rows.length.toLocaleString()} filas.</p>}
              {rejectedRows.length > 0 && <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><AlertTriangle size={16} className="mt-0.5 shrink-0" />Las filas con error no se enviarán. Corrige el SKU o la ubicación y vuelve a subir el archivo.</div>}
              <div className="mt-5 flex justify-end gap-3"><button onClick={onClose} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Cancelar</button><button onClick={handleSave} disabled={!readyRows.length || saving} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50">{saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Confirmar {readyRows.length} carga(s)</button></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
