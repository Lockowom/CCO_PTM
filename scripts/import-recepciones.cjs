/**
 * Script de importación masiva de recepciones desde Excel IMPORTACIONES 25_26
 * Inserta headers desde hoja RESUMEN + items de cada hoja con CODIGO/DESCRIPCION
 */
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vtrtyzbgpsvqwbfoudaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cnR5emJncHN2cXdiZm91ZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzMwMDQsImV4cCI6MjA4NjMwOTAwNH0.NijuPeeOMwLyM8H_AiagKXEut1TMr2qkQZ6CHLn4RSM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const FILE_PATH = String.raw`C:\Users\crisc\Downloads\IMPORTACIONES 25_26 (1).xlsx`;

// ======== MAPPING: sheet name → { proveedor, oc } ========
// Priority: match from RESUMEN, fallback: parse sheet name
const SHEET_TO_RECEPTION = {
  'GIVAS 21338': { proveedor: 'GIVAS', oc: '21338' },
  'BCF 21340': { proveedor: 'BCF', oc: '21340' },
  ' 21314 KOWSER': { proveedor: 'KOWSER', oc: '21314' },
  '20862 Opus PTM ': { proveedor: 'OPUS PTM', oc: '20862' },
  'FRANCEHOPITAL 21259': { proveedor: 'FRANCEHOPITAL', oc: '21259' },
  'FARMAPACK 05326': { proveedor: 'FARMAPACK', oc: '05326' },
  'INSTRAMED  OC 21225': { proveedor: 'INSTRAMED', oc: '21225' },
  'MANWELL OC 21235': { proveedor: 'MANWELL', oc: '21235' },
  'BCF 21248': { proveedor: 'BCF', oc: '21248' },
  'INSTRAMED OC 21222': { proveedor: 'INSTRAMED', oc: '21222' },
  'GUANGZHOU MICO 21235': { proveedor: 'GUANGZHOU MICO', oc: '21235' },
  'LANXI "HUB" 21201': { proveedor: 'LANXI HUB', oc: '21201' },
  '21184 BIOMBOS 0TW': { proveedor: '0TW', oc: '21184' },
  'BAXTER 21123': { proveedor: 'BAXTER', oc: '21123' },
  '20485 BCF': { proveedor: 'BCF', oc: '20485' },
  '21073  BETTER': { proveedor: 'BETTER', oc: '21073' },
  '21072 SAIKANG': { proveedor: 'SAIKANG', oc: '21072' },
  'ADE 21088': { proveedor: 'ADE', oc: '21088' },
  '21077 SILLA DE RUEDAS': { proveedor: 'VITALITY', oc: '21077' },
  'MIA MED OC 21255': { proveedor: 'MIA MED', oc: '21255' },
  'GIVAS 20994': { proveedor: 'GIVAS', oc: '20994' },
  'ACURIO 20989': { proveedor: 'ACURIO', oc: '20989' },
  'Vitality 20919': { proveedor: 'VITALITY', oc: '20919' },
  'CONTEC': { proveedor: 'CONTEC', oc: '21106' },
  'SAIKANG 21005': { proveedor: 'SAIKANG', oc: '21005' },
  'FARMAPACK': { proveedor: 'FARMAPACK', oc: '' },
  'FLYTEC': { proveedor: 'FLYTEC', oc: '' },
  'TWB 20828': { proveedor: 'TWB', oc: '20828' },
  'YUWELL ': { proveedor: 'YUWELL', oc: '' },
  'MALU 20816': { proveedor: 'MALU', oc: '20816' },
  'BETTER': { proveedor: 'BETTER', oc: '20947' },
  'FH 20711': { proveedor: 'FRANCEHOPITAL', oc: '20711' },
  'OC36 FARMA': { proveedor: 'FARMAPACK', oc: '36' },
  'OC35 FARMA': { proveedor: 'FARMAPACK', oc: '35' },
  'VITALITY 20836 -20835': { proveedor: 'VITALITY', oc: '20836' },
  'VITALITY 20835': { proveedor: 'VITALITY', oc: '20835' },
  'OC 20669 WELCH': { proveedor: 'WELCH ALLYN', oc: '20669' },
  'OC 20647 IMO ': { proveedor: 'IMO', oc: '20647' },
  'OC 20790 FAVA': { proveedor: 'FAVA', oc: '20790' },
  'GIVAS 20772': { proveedor: 'GIVAS', oc: '20772' },
  'BATERIAS INSTRAMED 20884': { proveedor: 'INSTRAMED', oc: '20884' },
  'OC 20638 HUB': { proveedor: 'LANXI HUB', oc: '20638' },
};

// RESUMEN data for fecha, bultos, pallets, tipo_cont
const RESUMEN_DATA = {
  '21073_SAIKANG': { fecha: '2026-02-24', bultos: 42, pallets: 28, tipo: '1HCX20' },
  '21088_ADE': { fecha: '2026-02-23', bultos: 0, pallets: 8, tipo: '1HCX20' },
  '21106_CONTEC': { fecha: '2026-02-26', bultos: 25, pallets: 2, tipo: '3-4' },
  '36_FARMAPACK': { fecha: '2026-03-01', bultos: 8, pallets: 1, tipo: '3-4' },
  '21123_BAXTER': { fecha: '2026-03-10', bultos: 0, pallets: 2, tipo: '3-4' },
  '21184_0TW': { fecha: '2026-03-19', bultos: 75, pallets: 5, tipo: '3-4' },
  '21235_GUANGZHOU MICO': { fecha: '2026-03-25', bultos: 1, pallets: 1, tipo: '3-4' },
  '21222_INSTRAMED': { fecha: '2026-03-31', bultos: 28, pallets: 2, tipo: '3-4' },
  '21235_MANWELL': { fecha: '2026-04-06', bultos: 374, pallets: 26, tipo: '1HCX40' },
  '21260_SAIKANG': { fecha: '2026-04-07', bultos: 237, pallets: 27, tipo: '2HCX40' },
  '21248_BCF': { fecha: '2026-04-07', bultos: 72, pallets: 9, tipo: '3-4' },
  '21201_LANXI HUB': { fecha: '2026-04-09', bultos: 300, pallets: 8, tipo: '3-4' },
  '21259_FRANCEHOPITAL': { fecha: '2026-04-23', bultos: 20, pallets: 20, tipo: '3-4' },
  '21235_MIA MED': { fecha: '2026-04-13', bultos: 45, pallets: 45, tipo: '1HCX40' },
  '21338_GIVAS': { fecha: '2026-04-16', bultos: 3, pallets: 3, tipo: '1HCX20' },
  '21314_KOWSER': { fecha: '2026-05-04', bultos: 1310, pallets: 2, tipo: '3-4' },
  '21340_BCF': { fecha: '2026-05-11', bultos: 118, pallets: 13, tipo: '1HCX40' },
};

function findColumnIndex(headerRow, ...names) {
  for (const name of names) {
    const idx = headerRow.findIndex(h => String(h).toUpperCase().trim().includes(name.toUpperCase()));
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseItemsFromSheet(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const nonEmpty = data.filter(row => row.some(c => c !== '' && c !== null && c !== undefined));
  if (nonEmpty.length <= 1) return [];

  // Find header row with CODIGO
  let hdrIdx = -1;
  for (let i = 0; i < Math.min(nonEmpty.length, 5); i++) {
    const s = JSON.stringify(nonEmpty[i]).toUpperCase();
    if (s.includes('CODIGO') && (s.includes('DESCRIPCI') || s.includes('DESCRIPCON'))) {
      hdrIdx = i;
      break;
    }
  }
  if (hdrIdx < 0) return [];

  const hdr = nonEmpty[hdrIdx];
  const colCodigo = findColumnIndex(hdr, 'CODIGO');
  const colDesc = findColumnIndex(hdr, 'DESCRIPCION', 'DESCRIPCON');
  const colUM = findColumnIndex(hdr, 'U.M', 'U,M');
  const colCant = findColumnIndex(hdr, 'CANTIDAD', 'CANT');
  const colSerie = findColumnIndex(hdr, 'SERIE');
  const colPartida = findColumnIndex(hdr, 'PARTIDA', 'LOTE');

  // Also look for REFF column (some sheets have it separate)
  const colReff = findColumnIndex(hdr, 'REFF');

  const items = [];
  for (let i = hdrIdx + 1; i < nonEmpty.length; i++) {
    const row = nonEmpty[i];
    const codigo = String(row[colCodigo] || '').trim();
    if (!codigo || codigo.length < 3) continue;

    let serie = colSerie >= 0 ? String(row[colSerie] || '').trim() : '';
    let lote = colPartida >= 0 ? String(row[colPartida] || '').trim() : '';
    // Clean up numeric serials
    if (serie && !isNaN(serie)) serie = String(serie);
    if (lote && !isNaN(lote)) lote = String(lote);

    items.push({
      reff: codigo.toUpperCase().slice(0, 50),
      descripcion: colDesc >= 0 ? String(row[colDesc] || '').trim().slice(0, 200) : '',
      um: colUM >= 0 ? (String(row[colUM] || 'UNI').trim() || 'UNI') : 'UNI',
      cantidad: colCant >= 0 ? (parseInt(row[colCant]) || 1) : 1,
      serie: serie.slice(0, 100),
      lote: lote.slice(0, 100),
      box: ''
    });
  }
  return items;
}

async function main() {
  console.log('=== IMPORTACIÓN MASIVA DE RECEPCIONES ===\n');

  const wb = XLSX.readFile(FILE_PATH);

  let totalCreated = 0;
  let totalItems = 0;
  let errors = [];

  for (const [sheetName, info] of Object.entries(SHEET_TO_RECEPTION)) {
    const items = parseItemsFromSheet(wb, sheetName);
    if (items.length === 0) {
      console.log(`  SKIP: ${sheetName} (sin items parseables)`);
      continue;
    }

    // Get RESUMEN data if available
    const key = `${info.oc}_${info.proveedor}`;
    const resumen = RESUMEN_DATA[key];

    const headerData = {
      fecha_recepcion: resumen?.fecha || '2026-01-01',
      proveedor: info.proveedor,
      oc: info.oc || null,
      cant_bultos: resumen?.bultos || 0,
      pallets_usados: resumen?.pallets || 0,
      tipo_contenedor: resumen?.tipo || '3-4',
      notas: `Importado desde Excel: ${sheetName}`,
      productos: items.map(i => i.reff).join(', ').slice(0, 500),
      cantidades: items.map(i => i.cantidad).join(', '),
      items_count: items.length,
      estado: info.oc ? 'COMPLETADO' : 'EN_REVISION',
      usuario_nombre: 'IMPORT-EXCEL'
    };

    // Check if already exists (same proveedor + OC)
    if (info.oc) {
      const { data: existing } = await supabase
        .from('tms_recepciones')
        .select('id')
        .eq('proveedor', info.proveedor)
        .eq('oc', info.oc)
        .limit(1);
      if (existing && existing.length > 0) {
        console.log(`  EXISTS: ${info.proveedor} OC:${info.oc} — skipping`);
        continue;
      }
    }

    // Insert header
    const { data: recData, error: recErr } = await supabase
      .from('tms_recepciones')
      .insert(headerData)
      .select('id')
      .single();

    if (recErr) {
      errors.push(`${sheetName}: ${recErr.message}`);
      console.log(`  ERROR: ${sheetName} — ${recErr.message}`);
      continue;
    }

    // Insert items in batches of 50
    const recId = recData.id;
    const itemsToInsert = items.map(item => ({
      recepcion_id: recId,
      reff: item.reff,
      descripcion: item.descripcion,
      um: item.um,
      cantidad: item.cantidad,
      serie: item.serie,
      lote: item.lote,
      box: item.box
    }));

    for (let b = 0; b < itemsToInsert.length; b += 50) {
      const batch = itemsToInsert.slice(b, b + 50);
      const { error: itemErr } = await supabase.from('tms_recepcion_items').insert(batch);
      if (itemErr) {
        errors.push(`${sheetName} items batch ${b}: ${itemErr.message}`);
        console.log(`  ERROR items: ${sheetName} — ${itemErr.message}`);
      }
    }

    totalCreated++;
    totalItems += items.length;
    console.log(`  OK: ${info.proveedor} OC:${info.oc || 'N/A'} — ${items.length} items (${resumen ? 'con RESUMEN' : 'sin RESUMEN'})`);
  }

  console.log('\n=== RESULTADO ===');
  console.log(`  Recepciones creadas: ${totalCreated}`);
  console.log(`  Items insertados: ${totalItems}`);
  console.log(`  Errores: ${errors.length}`);
  if (errors.length > 0) {
    console.log('  Detalle errores:');
    errors.forEach(e => console.log(`    - ${e}`));
  }
}

main().catch(err => console.error('FATAL:', err));
