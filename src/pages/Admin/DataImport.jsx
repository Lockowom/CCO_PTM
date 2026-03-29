// DataImport.jsx - Módulo de Carga Masiva de Datos (elimina cuello de botella Google Sheets)
import React, { useState, useRef, useCallback } from 'react';
import {
    Upload, FileText, Layers, Barcode, Package, ClipboardPaste,
    CheckCircle, XCircle, AlertCircle, Loader2, Trash2, Download,
    ArrowRight, SkipForward, RefreshCw, Database, Check, X, Info, Truck
} from 'lucide-react';
import { supabase } from '../../supabase';

import { useAuth } from '../../context/AuthContext'; // NEW: Importar para saber quién sube

// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN DE TABS Y COLUMNAS ESPERADAS POR TIPO
// ═══════════════════════════════════════════════════════════
const IMPORT_TABS = [
    {
        id: 'nv',
        label: 'N.V Diarias',
        icon: FileText,
        color: 'indigo',
        table: 'tms_nv_diarias',
        uniqueKey: 'nv,codigo_producto', // Campo clave para deduplicación (compuesta para permitir múltiples items por NV)
        defaultValues: { estado: 'Pendiente' },
        // ORDEN DE COLUMNAS SEGÚN EL EXCEL:
        // Fecha Entrega | N.Venta | Estado | Cod.Cliente | Nombre Cliente | Cod.Vendedor | Nombre Vendedor | Zona | Cod.Producto | Descripcion | Unidad | Pedido
        columns: [
            { key: 'fecha_emision', label: 'Fecha Entrega', required: false, type: 'date', optional: true },
            { key: 'nv', label: 'N.Venta', required: true, type: 'text' },
            { key: 'estado_erp', label: 'Estado ERP', required: false, type: 'text' },
            { key: 'cod_cliente', label: 'Cod.Cliente', required: false, type: 'text' },
            { key: 'cliente', label: 'Nombre Cliente', required: true, type: 'text' },
            { key: 'cod_vendedor', label: 'Cod.Vendedor', required: false, type: 'text' },
            { key: 'vendedor', label: 'Nombre Vendedor', required: false, type: 'text' },
            { key: 'zona', label: 'Zona', required: false, type: 'text' },
            { key: 'codigo_producto', label: 'Cod.Producto', required: true, type: 'text' },
            { key: 'descripcion_producto', label: 'Descripción', required: false, type: 'text' },
            { key: 'unidad', label: 'Unidad Medida', required: false, type: 'text' },
            { key: 'cantidad', label: 'Pedido', required: true, type: 'number' },
        ],
        helpText: '💡 Pega TODAS las N.V. El sistema detecta automáticamente cuáles son NUEVAS. Si una línea ya existe, se actualizarán sus datos (ej: cambios en cantidad). Las N.V. eliminadas manualmente NO se volverán a cargar.',
        smartDedup: true, // Activar deduplicación inteligente
        allowUpdate: true, // Permitir actualizar registros existentes
    },
    {
        id: 'partidas',
        label: 'Partidas',
        icon: Layers,
        color: 'blue',
        table: 'tms_partidas',
        uniqueKey: 'codigo_producto, partida', // Definir la clave compuesta para el upsert
        columns: [
            { key: 'codigo_producto', label: 'Código Producto', required: true, type: 'text' },
            { key: 'producto', label: 'Producto', required: false, type: 'text' },
            { key: 'unidad_medida', label: 'U. Medida', required: false, type: 'text' },
            { key: 'partida', label: 'Partida / Talla', required: true, type: 'text' },
            { key: 'fecha_vencimiento', label: 'Fecha Venc.', required: false, type: 'date' },
            { key: 'disponible', label: 'Disponible', required: false, type: 'number' },
            { key: 'reserva', label: 'Reserva', required: false, type: 'number' },
            { key: 'transitoria', label: 'Transitoria', required: false, type: 'number' },
            { key: 'consignacion', label: 'Consignación', required: false, type: 'number' },
            { key: 'stock_total', label: 'Stock Total', required: false, type: 'number' },
            { key: 'estado', label: 'Estado', required: false, type: 'text' },
        ],
        helpText: '📦 Pega los datos de partidas. Si ya existe un registro con el mismo Código y Partida, se actualizará (Upsert).',
        smartDedup: false,
    },
    {
        id: 'series',
        label: 'Series',
        icon: Barcode,
        color: 'violet',
        table: 'tms_series',
        uniqueKey: 'serie', // Definir la clave única para el upsert
        columns: [
            { key: 'codigo_producto', label: 'Código Producto', required: true, type: 'text' },
            { key: 'producto', label: 'Producto', required: false, type: 'text' },
            { key: 'unidad_medida', label: 'U. Medida', required: false, type: 'text' },
            { key: 'serie', label: 'Serie (SN)', required: true, type: 'text' },
            { key: 'disponible', label: 'Disponible', required: false, type: 'number' },
            { key: 'reserva', label: 'Reserva', required: false, type: 'number' },
            { key: 'transitoria', label: 'Transitoria', required: false, type: 'number' },
            { key: 'consignacion', label: 'Consignación', required: false, type: 'number' },
            { key: 'stock_total', label: 'Stock Total', required: false, type: 'number' },
            { key: 'estado', label: 'Estado', required: false, type: 'text' },
        ],
        helpText: '🔢 Pega los datos de series. Si una serie ya existe, se actualizarán sus datos (Upsert).',
        smartDedup: false, // Usar upsert nativo de base de datos
    },
    {
        id: 'farmapack',
        label: 'Farmapack',
        icon: Package,
        color: 'emerald',
        table: 'tms_farmapack',
        uniqueKey: 'codigo_producto, lote', // Clave compuesta para evitar duplicados
        columns: [
            { key: 'codigo_producto', label: 'Código Producto', required: true, type: 'text' },
            { key: 'producto', label: 'Producto', required: false, type: 'text' },
            { key: 'unidad_medida', label: 'U. Medida', required: false, type: 'text' },
            { key: 'lote', label: 'Lote', required: true, type: 'text' },
            { key: 'fecha_vencimiento', label: 'Fecha Venc.', required: false, type: 'date' },
            { key: 'disponible', label: 'Disponible', required: false, type: 'number' },
            { key: 'reserva', label: 'Reserva', required: false, type: 'number' },
            { key: 'transitoria', label: 'Transitoria', required: false, type: 'number' },
            { key: 'consignacion', label: 'Consignación', required: false, type: 'number' },
            { key: 'stock_total', label: 'Stock Total', required: false, type: 'number' },
            { key: 'estado', label: 'Estado', required: false, type: 'text' },
        ],
        helpText: '💊 Pega los datos de Farmapack. Se actualizarán (Upsert) los registros existentes del mismo código+lote.',
        smartDedup: false,
    },
    {
        id: 'inventario',
        label: 'Inventario (WMS)',
        icon: Database,
        color: 'orange',
        table: 'wms_ubicaciones',
        uniqueKey: null, // Insertar directamente sin upsert para permitir duplicados y evitar errores
        columns: [
            { key: 'ubicacion', label: 'UBICACION', required: true, type: 'text' },
            { key: 'codigo', label: 'CODIGO', required: true, type: 'text' },
            { key: 'serie', label: 'SERIE', required: false, type: 'text' },
            { key: 'partida', label: 'PARTIDA', required: false, type: 'text' },
            { key: 'pieza', label: 'PIEZA DEL PRODUCTO', required: false, type: 'text' },
            { key: 'fecha_vencimiento', label: 'FECHA DE VENCIMIENTO', required: false, type: 'date' },
            { key: 'talla', label: 'Talla del producto', required: false, type: 'text' },
            { key: 'color', label: 'Color del Producto', required: false, type: 'text' },
            { key: 'cantidad', label: 'Cantidad Contada', required: true, type: 'number' },
            { key: 'descripcion', label: 'DESCRIPCION', required: false, type: 'text' },
        ],
        helpText: '🏭 Pega el inventario completo. Se guardará TODO tal cual, permitiendo duplicados y fechas inválidas (se guardarán como vacías).',
        smartDedup: false,
    },
    {
        id: 'matriz_codigos',
        label: 'Matriz Códigos',
        icon: Barcode,
        color: 'cyan',
        table: 'tms_matriz_codigos',
        uniqueKey: 'codigo_producto',
        columns: [
            { key: 'codigo_producto', label: 'Cod. Producto', required: true, type: 'text' },
            { key: 'producto', label: 'Producto', required: true, type: 'text' },
            { key: 'unidad_medida', label: 'Cod. U. Medida', required: false, type: 'text' },
        ],
        helpText: '🏷️ Pega el maestro de códigos. Actualiza descripciones y unidades de medida. Si el código ya existe, se actualiza la información.',
        smartDedup: false, // Usa upsert
    },
    {
        id: 'control_despacho',
        label: 'Control Despacho',
        icon: Truck,
        color: 'rose',
        table: 'tms_control_despacho',
        uniqueKey: null, // Insertar siempre, sin verificar duplicados
        columns: [
            { key: 'fecha_docto', label: 'FECHA DOCTO', required: false, type: 'date' },
            { key: 'cliente', label: 'CLIENTE', required: true, type: 'text' },
            { key: 'facturas', label: 'FACTURAS', required: false, type: 'text' },
            { key: 'guia', label: 'GUIA', required: true, type: 'text' },
            { key: 'bultos', label: 'BULTOS', required: false, type: 'number' },
            { key: 'empresa_transporte', label: 'EMPRESA TRANSPORTE', required: false, type: 'text' },
            { key: 'transportista', label: 'TRANSPORTISTA', required: false, type: 'text' },
            { key: 'nv', label: 'N° NV', required: false, type: 'text' },
            { key: 'division', label: 'DIVISION', required: false, type: 'text' },
            { key: 'vendedor', label: 'VENDEDOR', required: false, type: 'text' },
            { key: 'fecha_despacho', label: 'FECHA DESPACHO', required: false, type: 'date' },
            { key: 'valor_flete', label: 'VALOR FLETE', required: false, type: 'number' },
            { key: 'numero_envio', label: 'N° DE ENVIO', required: false, type: 'text' },
        ],
        helpText: '🚚 Pega la planilla de Control de Despacho. Se insertarán todos los registros (sin validación de duplicados).',
        smartDedup: false, // Usa upsert
    }
];

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
const DataImport = () => {
    const { user } = useAuth(); // Obtener el usuario actual
    const [activeTab, setActiveTab] = useState('nv');
    const [rawText, setRawText] = useState('');
    const [parsedRows, setParsedRows] = useState([]);
    const [rowStatuses, setRowStatuses] = useState([]); // 'new' | 'existing' | 'error' | 'loaded'
    const [isParsing, setIsParsing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadResult, setLoadResult] = useState(null);
    const [step, setStep] = useState('paste'); // 'paste' | 'preview' | 'done'
    const [skipFirstColumn, setSkipFirstColumn] = useState(false); // NEW: Opción para omitir fecha
    const [syncDeleted, setSyncDeleted] = useState(false); // NEW: Opción para cancelar ítems eliminados
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const currentTab = IMPORT_TABS.find(t => t.id === activeTab);

    // ─── PARSEAR TEXTO PEGADO (TSV desde Excel) ───
    const parseData = useCallback(async (text) => {
        if (!text.trim()) return;

        setIsParsing(true);
        const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);

        if (lines.length === 0) {
            setIsParsing(false);
            return;
        }

        // Detectar separador (tab o ;)
        const firstLine = lines[0];
        const separator = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

        // Primera línea puede ser headers — detectar
        const firstCells = firstLine.split(separator).map(c => c.trim());
        const isHeader = currentTab.columns.some(col =>
            firstCells.some(cell =>
                cell.toLowerCase().replace(/[^a-z0-9]/g, '') === col.label.toLowerCase().replace(/[^a-z0-9]/g, '') ||
                cell.toLowerCase().replace(/[^a-z0-9]/g, '') === col.key.toLowerCase().replace(/[^a-z0-9]/g, '')
            )
        );

        const dataLines = isHeader ? lines.slice(1) : lines;

        // Parsear cada línea
        const rows = dataLines.map(line => {
            const cells = line.split(separator).map(c => c.trim());
            const row = {};

            // Aplicar lógica de skipFirstColumn si es necesario
            let cellIdx = 0;
            
            // Si skipFirstColumn está activo (significa que NO traen fecha), 
            // saltamos la columna fecha (idx=0) en el mapeo de destino, PERO leemos desde cells[0] para la columna siguiente
            // OJO: La lógica es al revés: 
            // Si el usuario marca "Sin Fecha", significa que su col 0 es NV (idx=1 en config).
            // Entonces, para la col fecha (idx=0 en config), no asignamos nada.
            // Y para col NV (idx=1 en config), leemos cells[0].
            
            currentTab.columns.forEach((col, colIdx) => {
                let value = '';

                if (activeTab === 'nv' && skipFirstColumn && col.key === 'fecha_emision') {
                    // Si estamos saltando fecha, esta columna queda vacía
                    value = null; 
                    // NO avanzamos cellIdx porque no consumimos celda del excel
                } else {
                    value = cells[cellIdx] || '';
                    cellIdx++;
                }

                // Limpiar y convertir tipos
                if (col.type === 'number') {
                    value = value.replace(/[^\d.,\-]/g, '').replace(',', '.');
                    value = parseFloat(value) || 0;
                } else if (col.type === 'date') {
                    // Limpieza y validación de fecha robusta
                    if (value && value.trim() !== '') {
                        // Ignorar valores que no son fechas (ej: 'UNI', 'PZA', 'SIN FECHA')
                        if (value.length < 6 || !/\d/.test(value)) { 
                            value = null;
                        } else {
                            // Intentar limpiar formatos extraños como "2024-03-01 00:00:00" o con zona horaria
                            value = value.split(' ')[0]; // Quedarse solo con la parte YYYY-MM-DD si hay hora

                            // Formatos comunes: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
                            const dateMatch = value.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
                            if (dateMatch) {
                                const [_, d, m, y] = dateMatch;
                                const year = y.length === 2 ? `20${y}` : y;
                                const isoDate = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                                const dateObj = new Date(year, parseInt(m) - 1, d);

                                if (dateObj.getFullYear() == year && dateObj.getMonth() == parseInt(m) - 1 && dateObj.getDate() == d) {
                                    value = isoDate;
                                } else {
                                    value = null; 
                                }
                            } else {
                                // Si ya es YYYY-MM-DD u otro formato que JS entienda
                                // Validar rango para evitar "time zone displacement out of range"
                                // Postgres acepta años desde 4713 BC hasta 294276 AD, pero JS es más limitado
                                const timestamp = Date.parse(value);
                                if (!isNaN(timestamp)) {
                                    const d = new Date(timestamp);
                                    const year = d.getFullYear();
                                    // Filtrar años absurdos que rompen la base de datos (ej: año 0, año 200000)
                                    if (year > 1900 && year < 2100) {
                                        value = d.toISOString().split('T')[0];
                                    } else {
                                        value = null;
                                    }
                                } else {
                                    value = null;
                                }
                            }
                        }
                    } else {
                        value = null;
                    }
                } else {
                    value = value.toString().trim();
                }

                row[col.key] = value;
            });

            // Agregar valores por defecto
            if (currentTab.defaultValues) {
                Object.entries(currentTab.defaultValues).forEach(([k, v]) => {
                    if (!row[k]) row[k] = v;
                });
            }

            return row;
        }).filter(row => {
            // Filtrar filas vacías (que no tienen ningún campo requerido)
            return currentTab.columns
                .filter(c => c.required)
                .some(c => row[c.key] && row[c.key] !== '' && row[c.key] !== 0);
        });

        setParsedRows(rows);

        // ─── DEDUPLICACIÓN INTELIGENTE (para N.V) ───
        if (currentTab.smartDedup && currentTab.uniqueKey && rows.length > 0) {
            try {
                // Separar la clave (ej: 'nv,codigo_producto') para poder verificar líneas exactas
                const keysDef = currentTab.uniqueKey.split(',').map(k => k.trim());
                const firstKey = keysDef[0]; // 'nv'

                // Extraer las NVs únicas del pegado
                const firstKeyValues = [...new Set(rows.map(r => r[firstKey]).filter(Boolean))];

                // Consultar cuáles ya existen en Supabase (traemos todos los campos de la clave)
                const selectFields = keysDef.join(',');
                const { data: existing, error: errorExisting } = await supabase
                    .from(currentTab.table)
                    .select(selectFields)
                    .in(firstKey, firstKeyValues)
                    .limit(2000); // Aumentar límite para evitar falsos negativos en cargas grandes

                if (errorExisting) throw errorExisting;

                // Consultar cuáles han sido ELIMINADAS MANUALMENTE (solo verificamos el firstKey 'nv')
                let deletedKeys = new Set();
                if (currentTab.id === 'nv') {
                    const { data: deleted, error: errorDeleted } = await supabase
                        .from('tms_nv_eliminadas')
                        .select(firstKey)
                        .in(firstKey, firstKeyValues);

                    if (!errorDeleted && deleted) {
                        // Normalizar a mayúsculas para comparación robusta
                        deletedKeys = new Set(deleted.map(d => d[firstKey]?.toString().trim().toUpperCase()));
                    }
                }

                // Generar Set de claves compuestas (ej: '95924|0AD46651225S') normalizadas
                const existingKeys = new Set((existing || []).map(r =>
                    keysDef.map(k => r[k]?.toString().trim().toUpperCase()).join('|')
                ));

                // Marcar cada fila considerando TODOS los elementos de la clave
                const statuses = rows.map(row => {
                    const fkVal = row[firstKey]?.toString().trim().toUpperCase();
                    if (!fkVal) return 'error';

                    // Si la NV entera está en la blacklist, ignoramos todas sus líneas
                    if (deletedKeys.has(fkVal)) return 'deleted';

                    const rowKey = keysDef.map(k => row[k]?.toString().trim().toUpperCase()).join('|');

                    // Si esta combinación NV + Producto específico ya existe, se marca existing (se omite)
                    if (existingKeys.has(rowKey)) return currentTab.allowUpdate ? 'update' : 'existing';

                    // Si no, es nuevo (NV totalmente nueva, o un producto nuevo agregado a una NV existente)
                    return 'new';
                });

                setRowStatuses(statuses);
            } catch (err) {
                console.error('Error en deduplicación:', err);
                setRowStatuses(rows.map(() => 'new'));
            }
        } else {
            setRowStatuses(rows.map(() => 'new'));
        }

        setStep('preview');
        setIsParsing(false);
    }, [currentTab, skipFirstColumn]);

    // ─── MANEJAR PASTE ───
    const handlePaste = (e) => {
        const text = e.clipboardData?.getData('text/plain') || '';
        if (text) {
            setRawText(text);
            parseData(text);
        }
    };

    // ─── MANEJAR ARCHIVO CSV ───
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target.result;
            setRawText(text);
            parseData(text);
        };
        reader.readAsText(file);
    };

    // ─── CARGAR A SUPABASE ───
    const handleUpload = async () => {
        if (parsedRows.length === 0) return;

        setIsLoading(true);
        setLoadResult(null);

        try {
            // Filtrar solo las filas NUEVAS o para ACTUALIZAR
            const newRows = parsedRows.filter((_, idx) => 
                rowStatuses[idx] === 'new' || rowStatuses[idx] === 'update'
            );

            if (newRows.length === 0) {
                setLoadResult({
                    success: true,
                    total: parsedRows.length,
                    inserted: 0,
                    skipped: parsedRows.length,
                    errors: 0,
                    message: 'No hay registros nuevos para cargar. Todos ya existen en la base de datos.'
                });
                setStep('done');
                setIsLoading(false);
                return;
            }

            // ─── LÓGICA AVANZADA DE NV: PREPARAR Y RESETEAR ───
            // Si es NV, llamamos a prepare_nv_import ANTES de los upserts para:
            // 1. Detectar cambios en NVs en proceso y resetearlas a 'Pendiente'.
            // 2. Cancelar ítems eliminados (Sync Deleted).
            if (currentTab.id === 'nv' && newRows.length > 0) {
                try {
                    // Enviar payload simplificado para análisis (toda la carga de una vez)
                    // Nota: Si son demasiados registros (>5000), esto podría necesitar batching,
                    // pero para cargas típicas de Excel funciona bien.
                    const litePayload = newRows.map(r => ({
                        nv: r.nv?.toString(),
                        codigo_producto: r.codigo_producto?.toString(),
                        cantidad: r.cantidad,
                        cliente: r.cliente
                    }));

                    const { data: prepData, error: prepError } = await supabase.rpc('prepare_nv_import', { 
                        payload: litePayload,
                        sync_deleted: syncDeleted 
                    });

                    if (prepError) {
                        console.error('Error en prepare_nv_import:', prepError);
                        errorDetails.push(`Advertencia: No se pudo verificar NVs en proceso. ${prepError.message}`);
                    } else if (prepData) {
                        if (prepData.reseteadas > 0) {
                            errorDetails.push(`ℹ️ Se reiniciaron ${prepData.reseteadas} N.V. que estaban en proceso por cambios detectados.`);
                        }
                        if (prepData.items_cancelados > 0) {
                            errorDetails.push(`🗑️ Se cancelaron ${prepData.items_cancelados} ítems que ya no venían en la carga.`);
                        }
                    }
                } catch (prepErr) {
                    console.error('Error invocando lógica avanzada NV:', prepErr);
                }
            }

            // Insertar en lotes de 100
            const BATCH_SIZE = 100;
            let inserted = 0;
            let errors = 0;
            const errorDetails = [];

            for (let i = 0; i < newRows.length; i += BATCH_SIZE) {
                let batch = newRows.slice(i, i + BATCH_SIZE);

                // DEDUPLICACIÓN EN EL FRONTEND (CRÍTICO)
                // Si enviamos claves duplicadas en el mismo lote a Supabase UPSERT, falla con:
                // "ON CONFLICT DO UPDATE command cannot affect row a second time"
                if (currentTab.uniqueKey) {
                    const uniqueMap = new Map();
                    const keys = currentTab.uniqueKey.split(',').map(k => k.trim());

                    batch.forEach(row => {
                        // Generar clave compuesta
                        const keyVal = keys.map(k => row[k]).join('|');
                        // Sobreescribir para quedarse con el último (o el primero si se prefiere)
                        uniqueMap.set(keyVal, row);
                    });

                    batch = Array.from(uniqueMap.values());
                }

                let result;

                // Si la tabla no tiene uniqueKey o es Control Despacho, usamos INSERT directo (permite duplicados)
                if (!currentTab.uniqueKey || currentTab.id === 'control_despacho') {
                    console.log('Insertando datos sin UPSERT (Modo Insert Directo)...');
                    result = await supabase
                        .from(currentTab.table)
                        .insert(batch);
                } else {
                    // Si tiene uniqueKey, usamos UPSERT
                    result = await supabase
                        .from(currentTab.table)
                        .upsert(batch, {
                            onConflict: currentTab.uniqueKey,
                            ignoreDuplicates: false // IMPORTANTE: False para actualizar (update), True para ignorar
                        });
                }

                const { error } = result;

                if (error) {
                    // Mejor manejo de errores
                    if (error.code === '23505' || error.message?.includes('duplicate key')) {
                        // Error de duplicados
                        if (currentTab.smartDedup) {
                            // Si está activado smartDedup, esto no debería pasar, pero por si acaso
                            errors += batch.length;
                            errorDetails.push(`Error de duplicados en lote: ${error.message}`);
                        } else {
                            // Si no es smartDedup, upsert falló o no está configurado
                            errors += batch.length;
                            errorDetails.push(`Registros duplicados detectados. Verifica que la columna clave '${currentTab.uniqueKey || 'id'}' sea única.`);
                        }
                    } else {
                        console.error('Error en batch:', error);
                        errors += batch.length;
                        errorDetails.push(error.message);
                    }
                } else {
                    inserted += batch.length;
                }
            }

            // Actualizar estados de las filas cargadas
            const updatedStatuses = [...rowStatuses];
            let newIdx = 0;
            parsedRows.forEach((_, idx) => {
                if (rowStatuses[idx] === 'new' || rowStatuses[idx] === 'update') {
                    updatedStatuses[idx] = newIdx < inserted ? 'loaded' : 'error';
                    newIdx++;
                }
            });
            setRowStatuses(updatedStatuses);

            // ─── SINCRONIZACIÓN DE ÍTEMS ELIMINADOS (LEGACY: YA MANEJADO EN prepare_nv_import) ───
            let syncMessage = '';
            /* 
            // COMENTADO PORQUE YA SE MANEJA EN EL PASO PREVIO (prepare_nv_import)
            if (syncDeleted && currentTab.id === 'nv' && inserted > 0) {
                try {
                    // Agrupar códigos por NV para enviar al RPC
                    const nvGroups = {};
                    newRows.forEach(row => {
                        const nv = row.nv;
                        const codigo = row.codigo_producto;
                        if (nv && codigo) {
                            if (!nvGroups[nv]) nvGroups[nv] = new Set();
                            nvGroups[nv].add(codigo);
                        }
                    });

                    const payload = Object.entries(nvGroups).map(([nv, codigosSet]) => ({
                        nv,
                        codigos: Array.from(codigosSet)
                    }));

                    if (payload.length > 0) {
                        const { data: syncData, error: syncError } = await supabase.rpc('sync_deleted_items', { payload });
                        
                        if (syncError) {
                            console.error('Error sincronizando eliminados:', syncError);
                            errorDetails.push(`Advertencia: No se pudieron sincronizar ítems eliminados. ${syncError.message}`);
                        } else if (syncData && syncData.length > 0) {
                            const totalCancelados = syncData.reduce((acc, curr) => acc + (curr.items_cancelados || 0), 0);
                            syncMessage = ` 🗑️ Se cancelaron ${totalCancelados} ítems que ya no venían en la carga.`;
                        }
                    }
                } catch (errSync) {
                    console.error('Error en lógica de sync:', errSync);
                }
            } 
            */

            const skipped = parsedRows.length - newRows.length;

            // ─── GUARDAR EN HISTORIAL DE CARGAS ───
            try {
                if (user && (inserted > 0 || errors > 0)) {
                    await supabase.from('tms_historial_cargas').insert([{
                        usuario_id: user.id,
                        usuario_nombre: user.nombre || user.email || 'Usuario Desconocido',
                        modulo: currentTab.label,
                        tabla_destino: currentTab.table,
                        registros_totales: parsedRows.length,
                        registros_nuevos: rowStatuses.filter(s => s === 'new').length,
                        registros_actualizados: rowStatuses.filter(s => s === 'update').length,
                        registros_error: errors
                    }]);
                }
            } catch (logError) {
                console.error('No se pudo registrar en el historial de cargas:', logError);
            }

            setLoadResult({
                success: errors === 0,
                total: parsedRows.length,
                inserted,
                skipped,
                errors,
                errorDetails,
                message: (errors === 0
                    ? `✅ ${inserted} registros cargados exitosamente${skipped > 0 ? ` (${skipped} existentes ignorados)` : ''}`
                    : `⚠️ ${inserted} cargados, ${errors} con error${skipped > 0 ? `, ${skipped} ignorados` : ''}`) + syncMessage
            });

            setStep('done');

        } catch (err) {
            console.error('Error cargando datos:', err);
            setLoadResult({
                success: false,
                total: parsedRows.length,
                inserted: 0,
                skipped: 0,
                errors: parsedRows.length,
                message: `❌ Error: ${err.message}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ─── RESET ───
    const handleReset = () => {
        setRawText('');
        setParsedRows([]);
        setRowStatuses([]);
        setLoadResult(null);
        setStep('paste');
        setSkipFirstColumn(false); // Resetear checkbox
        setSyncDeleted(false); // Resetear checkbox sync
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ─── CAMBIAR TAB ───
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        handleReset();
    };

    // ─── STATS ───
    const stats = {
        total: parsedRows.length,
        new: rowStatuses.filter(s => s === 'new').length,
        update: rowStatuses.filter(s => s === 'update').length,
        existing: rowStatuses.filter(s => s === 'existing').length,
        deleted: rowStatuses.filter(s => s === 'deleted').length,
        loaded: rowStatuses.filter(s => s === 'loaded').length,
        error: rowStatuses.filter(s => s === 'error').length,
    };

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════
    return (
        <div className="space-y-6 relative min-h-screen pb-12">
            {/* Background Decorativo Sutil */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
                <div className="absolute top-[-10%] w-[800px] h-[400px] bg-orange-500/5 blur-[100px] rounded-full"></div>
            </div>

            {/* Panel de Control Principal */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm relative z-10 overflow-hidden">
                {/* Decorative Top Line */}
                <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400"></div>
                
                <div className="p-6 md:p-8">
                    {/* ── HEADER ── */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                                <Upload size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Carga de <span className="text-orange-500">Datos</span></h1>
                                <p className="text-slate-500 font-medium mt-1">Pega desde Excel → Carga directo a Supabase</p>
                            </div>
                        </div>
                        {step !== 'paste' && (
                            <button
                                onClick={handleReset}
                                className="px-5 py-3 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 text-slate-700 rounded-2xl font-bold flex items-center gap-2 transition-all border border-slate-200 hover:border-orange-200"
                            >
                                <RefreshCw size={18} /> Nueva Carga
                            </button>
                        )}
                    </div>

                    {/* ── TABS ── */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-inner p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
                        {IMPORT_TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            
                            // Mapeo a tonos naranjas/ámbar/neutros para mantener elegancia
                            const colorMap = {
                                indigo: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20',
                                blue: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20',
                                violet: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20',
                                emerald: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20',
                                orange: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20',
                                cyan: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20',
                                rose: 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20',
                            };

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    disabled={isLoading}
                                    className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${isActive
                                        ? `${colorMap[tab.color]} scale-[1.02]`
                                        : 'bg-transparent text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm'
                                        } disabled:opacity-50`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── STEP 1: PASTE ── */}
            {step === 'paste' && (
                <div className="flex flex-col gap-6 relative z-10">
                    {/* Help text */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
                        <div className="bg-orange-50 p-2.5 rounded-xl text-orange-500 flex-shrink-0 mt-0.5">
                            <Info size={24} />
                        </div>
                        <div>
                            <p className="text-slate-700 font-medium text-base mb-4 leading-relaxed">{currentTab.helpText}</p>
                            <div className="flex flex-wrap gap-2">
                                {currentTab.columns.map(col => (
                                    <span
                                        key={col.key}
                                        className={`text-xs px-3 py-1.5 rounded-lg font-mono tracking-tight ${col.required
                                            ? 'bg-orange-100 text-orange-800 font-bold border border-orange-200'
                                            : 'bg-slate-100 text-slate-600 font-medium border border-slate-200'
                                            }`}
                                    >
                                        {col.label}{col.required ? ' *' : ''}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Paste area */}
                    <div
                        className="relative border-2 border-dashed border-slate-300 rounded-3xl bg-white hover:border-orange-400 hover:bg-orange-50/10 transition-all cursor-text group min-h-[400px] flex flex-col shadow-sm"
                        onClick={() => textareaRef.current?.focus()}
                    >
                        {!rawText && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="w-24 h-24 bg-slate-50 rounded-3xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-50 transition-all duration-300 border border-slate-100">
                                    <ClipboardPaste size={40} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">Pega tus datos aquí</h3>
                                <p className="text-slate-500 text-base mb-6 font-medium">Ctrl+V desde Excel, SAP o cualquier hoja de cálculo</p>
                                <div className="flex items-center gap-4 w-64">
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">O</span>
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                </div>
                            </div>
                        )}
                        <textarea
                            ref={textareaRef}
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            onPaste={handlePaste}
                            className="w-full h-full flex-1 bg-transparent p-6 resize-none outline-none font-mono text-sm text-slate-700 placeholder:text-transparent rounded-3xl"
                            placeholder="Pega datos aquí..."
                        />
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                        <label className="flex items-center gap-2 px-6 py-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl text-slate-700 font-bold text-sm cursor-pointer hover:bg-slate-100 transition-colors">
                            <Upload size={18} />
                            Subir Archivo CSV
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.tsv,.txt"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>

                        {rawText && (
                            <div className="flex flex-wrap items-center gap-4">
                                {activeTab === 'nv' && (
                                    <label className="flex items-center gap-2 text-sm text-slate-700 bg-amber-50 px-4 py-3 rounded-2xl border border-amber-200 cursor-pointer select-none font-medium hover:bg-amber-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={skipFirstColumn}
                                            onChange={(e) => {
                                                setSkipFirstColumn(e.target.checked);
                                                if (rawText) {
                                                    setTimeout(() => parseData(rawText), 50);
                                                }
                                            }}
                                            className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500 border-amber-300"
                                        />
                                        <span>Mi Excel <strong>NO</strong> tiene fecha al inicio</span>
                                    </label>
                                )}
                                {activeTab === 'nv' && (
                                    <label className="flex items-center gap-2 text-sm text-slate-700 bg-rose-50 px-4 py-3 rounded-2xl border border-rose-200 cursor-pointer select-none font-medium hover:bg-rose-100 transition-colors" title="Si activas esto, los ítems de estas N.V. que NO vengan en el Excel se marcarán como CANCELADOS automáticamente.">
                                        <input
                                            type="checkbox"
                                            checked={syncDeleted}
                                            onChange={(e) => setSyncDeleted(e.target.checked)}
                                            className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500 border-rose-300"
                                        />
                                        <span>Sync: <strong>Cancelar</strong> lo que no venga</span>
                                    </label>
                                )}
                                <button
                                    onClick={() => parseData(rawText)}
                                    disabled={isParsing}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl font-black text-base shadow-lg shadow-slate-900/20 hover:shadow-orange-500/30 transition-all disabled:opacity-50"
                                >
                                    {isParsing ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                                    Procesar Datos
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── STEP 2: PREVIEW ── */}
            {step === 'preview' && parsedRows.length > 0 && (
                <div className="flex flex-col gap-6 relative z-10">
                    {/* Stats bar */}
                    <div className="flex flex-wrap gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm items-center">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                            <Database size={20} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-600">Total: <strong className="text-lg text-slate-800">{stats.total}</strong></span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                            <CheckCircle size={20} className="text-emerald-500" />
                            <span className="text-sm font-medium text-emerald-700">Nuevas: <strong className="text-lg">{stats.new}</strong></span>
                        </div>
                        {stats.update > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                                <RefreshCw size={20} className="text-blue-500" />
                                <span className="text-sm font-medium text-blue-700">Actualizar: <strong className="text-lg">{stats.update}</strong></span>
                            </div>
                        )}
                        {stats.existing > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                                <SkipForward size={20} className="text-amber-500" />
                                <span className="text-sm font-medium text-amber-700">Ya existen: <strong className="text-lg">{stats.existing}</strong></span>
                            </div>
                        )}
                        {stats.deleted > 0 && (
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                                <Trash2 size={20} className="text-rose-500" />
                                <span className="text-sm font-medium text-rose-700">Eliminadas: <strong className="text-lg">{stats.deleted}</strong></span>
                            </div>
                        )}
                        {stats.error > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
                                <XCircle size={20} className="text-red-500" />
                                <span className="text-sm font-medium text-red-700">Errores: <strong className="text-lg">{stats.error}</strong></span>
                            </div>
                        )}
                        <div className="flex-1" />
                        <button
                            onClick={handleUpload}
                            disabled={isLoading || (stats.new === 0 && stats.update === 0)}
                            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-2xl font-black text-lg flex items-center gap-3 shadow-lg shadow-emerald-500/30 transition-all disabled:shadow-none"
                        >
                            {isLoading ? (
                                <><Loader2 size={22} className="animate-spin" /> Cargando a BD...</>
                            ) : (
                                <><Upload size={22} /> Confirmar Carga ({stats.new + stats.update})</>
                            )}
                        </button>
                    </div>

                    {/* Tabla preview */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[60vh]">
                        <div className="overflow-auto flex-1 p-2">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-black tracking-wider sticky top-0 z-10 rounded-xl">
                                    <tr>
                                        <th className="px-4 py-4 w-12 rounded-tl-xl">#</th>
                                        <th className="px-4 py-4 w-24">Estado</th>
                                        {currentTab.columns.map((col, i) => (
                                            <th key={col.key} className={`px-4 py-4 whitespace-nowrap ${i === currentTab.columns.length - 1 ? 'rounded-tr-xl' : ''}`}>
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {parsedRows.map((row, idx) => {
                                        const status = rowStatuses[idx] || 'new';
                                        const bgClass = {
                                            'new': 'bg-emerald-50/30 hover:bg-emerald-50',
                                            'update': 'bg-blue-50/30 hover:bg-blue-50',
                                            'existing': 'bg-amber-50/30 hover:bg-amber-50',
                                            'deleted': 'bg-rose-50/30 hover:bg-rose-50',
                                            'loaded': 'bg-blue-50/30 hover:bg-blue-50',
                                            'error': 'bg-red-50/30 hover:bg-red-50',
                                        }[status];
                                        const statusIcon = {
                                            'new': <CheckCircle size={16} className="text-emerald-500" />,
                                            'update': <RefreshCw size={16} className="text-blue-500" />,
                                            'existing': <SkipForward size={16} className="text-amber-500" />,
                                            'deleted': <Trash2 size={16} className="text-rose-500" />,
                                            'loaded': <Check size={16} className="text-blue-500" />,
                                            'error': <XCircle size={16} className="text-red-500" />,
                                        }[status];
                                        const statusLabel = {
                                            'new': 'Nueva',
                                            'update': 'Actualiza',
                                            'existing': 'Existe',
                                            'deleted': 'Eliminada',
                                            'loaded': 'Cargada',
                                            'error': 'Error',
                                        }[status];

                                        return (
                                            <tr key={idx} className={`${bgClass} transition-colors`}>
                                                <td className="px-4 py-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5" title={statusLabel}>
                                                        {statusIcon}
                                                        <span className="text-xs font-bold">{statusLabel}</span>
                                                    </div>
                                                </td>
                                                {currentTab.columns.map(col => (
                                                    <td key={col.key} className="px-4 py-3 text-slate-700 whitespace-nowrap max-w-[200px] truncate" title={String(row[col.key] || '')}>
                                                        {col.type === 'number' ? (
                                                            <span className="font-mono font-bold bg-white px-2 py-1 rounded border border-slate-200">{row[col.key]}</span>
                                                        ) : (
                                                            <span className="font-medium">{row[col.key] || <span className="text-slate-300">-</span>}</span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 3: RESULTADO ── */}
            {step === 'done' && loadResult && (
                <div className="flex flex-col items-center justify-center py-12 relative z-10 animate-in zoom-in-95 duration-500">
                    <div className="max-w-2xl w-full text-center bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl">
                        <div className={`w-28 h-28 mx-auto rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border-4 ${loadResult.success ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-red-50 border-red-100 text-red-500'
                            }`}>
                            {loadResult.success ? (
                                <CheckCircle size={56} strokeWidth={2.5} />
                            ) : (
                                <AlertCircle size={56} strokeWidth={2.5} />
                            )}
                        </div>

                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
                            {loadResult.success ? '¡Carga Exitosa!' : 'Error en la Carga'}
                        </h2>
                        <p className="text-slate-500 text-lg mb-10 font-medium">{loadResult.message}</p>

                        {/* Stats cards */}
                        <div className="grid grid-cols-3 gap-6 mb-10">
                            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-6 transform hover:scale-105 transition-transform">
                                <p className="text-5xl font-black text-emerald-600 mb-1">{loadResult.inserted}</p>
                                <p className="text-sm font-bold text-emerald-700 uppercase tracking-widest">Cargados</p>
                            </div>
                            <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-6 transform hover:scale-105 transition-transform">
                                <p className="text-5xl font-black text-amber-600 mb-1">{loadResult.skipped}</p>
                                <p className="text-sm font-bold text-amber-700 uppercase tracking-widest">Ignorados</p>
                                {stats.deleted > 0 && <p className="text-xs font-bold text-rose-500 mt-2 bg-rose-100 py-1 rounded-lg">({stats.deleted} eliminados)</p>}
                            </div>
                            <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-6 transform hover:scale-105 transition-transform">
                                <p className="text-5xl font-black text-red-600 mb-1">{loadResult.errors}</p>
                                <p className="text-sm font-bold text-red-700 uppercase tracking-widest">Errores</p>
                            </div>
                        </div>

                        {loadResult.errorDetails?.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-left mb-8 max-h-48 overflow-y-auto">
                                <p className="text-sm font-black text-red-800 mb-3 uppercase tracking-wider">Detalle Técnico:</p>
                                {loadResult.errorDetails.map((e, i) => (
                                    <p key={i} className="text-xs text-red-600 font-mono mb-1 bg-white p-2 rounded-lg border border-red-100">{e}</p>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-center">
                            {loadResult.success ? (
                                <button
                                    onClick={handleReset}
                                    className="px-10 py-5 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-3"
                                >
                                    <RefreshCw size={24} />
                                    Realizar Nueva Carga
                                </button>
                            ) : (
                                <button
                                    onClick={() => setStep('paste')}
                                    className="px-10 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg shadow-lg transition-all flex items-center gap-3"
                                >
                                    <XCircle size={24} />
                                    Cerrar y Corregir Errores
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataImport;
