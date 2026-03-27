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
        <div className="h-full flex flex-col space-y-4">
            {/* ── HEADER ── */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Upload className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Carga de Datos</h1>
                        <p className="text-slate-500 text-sm">Pega desde Excel → Carga directo a Supabase (sin Google Sheets)</p>
                    </div>
                </div>
                {step !== 'paste' && (
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw size={16} /> Nueva Carga
                    </button>
                )}
            </div>

            {/* ── TABS ── */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-1 flex gap-1">
                {IMPORT_TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const colorMap = {
                        indigo: 'bg-indigo-600 text-white shadow-indigo-200',
                        blue: 'bg-blue-600 text-white shadow-blue-200',
                        violet: 'bg-violet-600 text-white shadow-violet-200',
                        emerald: 'bg-emerald-600 text-white shadow-emerald-200',
                        orange: 'bg-orange-600 text-white shadow-orange-200',
                        cyan: 'bg-cyan-600 text-white shadow-cyan-200',
                        rose: 'bg-rose-600 text-white shadow-rose-200',
                    };

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            disabled={isLoading}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-sm transition-all ${isActive
                                ? `${colorMap[tab.color]} shadow-lg`
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                } disabled:opacity-50`}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── STEP 1: PASTE ── */}
            {step === 'paste' && (
                <div className="flex-1 flex flex-col gap-4">
                    {/* Help text */}
                    <div className={`bg-${currentTab.color === 'indigo' ? 'indigo' : currentTab.color === 'blue' ? 'blue' : currentTab.color === 'violet' ? 'violet' : currentTab.color === 'emerald' ? 'emerald' : currentTab.color === 'cyan' ? 'cyan' : currentTab.color === 'rose' ? 'rose' : 'orange'}-50 border border-${currentTab.color}-200 rounded-xl p-4 flex items-start gap-3`}>
                        <Info size={20} className={`text-${currentTab.color}-500 flex-shrink-0 mt-0.5`} />
                        <div>
                            <p className={`text-${currentTab.color}-800 font-medium text-sm`}>{currentTab.helpText}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {currentTab.columns.map(col => (
                                    <span
                                        key={col.key}
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${col.required
                                            ? `bg-${currentTab.color}-200 text-${currentTab.color}-800 font-bold`
                                            : `bg-${currentTab.color}-100 text-${currentTab.color}-600`
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
                        className="flex-1 relative border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-text group"
                        onClick={() => textareaRef.current?.focus()}
                    >
                        {!rawText && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <ClipboardPaste size={36} className="text-indigo-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 mb-1">Pega tus datos aquí</h3>
                                <p className="text-slate-500 text-sm mb-4">Ctrl+V desde Excel, SAP o cualquier hoja de cálculo</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400">— o —</span>
                                </div>
                            </div>
                        )}
                        <textarea
                            ref={textareaRef}
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            onPaste={handlePaste}
                            className="w-full h-full min-h-[300px] bg-transparent p-4 resize-none outline-none font-mono text-xs text-slate-700 placeholder:text-transparent"
                            placeholder="Pega datos aquí..."
                        />
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-3 items-center">
                        <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium text-sm cursor-pointer hover:bg-slate-50 transition-colors">
                            <Upload size={16} />
                            Subir CSV
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.tsv,.txt"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>

                        {rawText && (
                            <div className="flex items-center gap-3">
                                {activeTab === 'nv' && (
                                    <label className="flex items-center gap-2 text-sm text-slate-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={skipFirstColumn}
                                            onChange={(e) => {
                                                setSkipFirstColumn(e.target.checked);
                                                // Si ya hay texto, reparsear automáticamente
                                                if (rawText) {
                                                    // Pequeño hack para forzar update
                                                    setTimeout(() => parseData(rawText), 50);
                                                }
                                            }}
                                            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                                        />
                                        <span>Mi Excel <strong>NO</strong> tiene fecha al inicio</span>
                                    </label>
                                )}
                                {activeTab === 'nv' && (
                                    <label className="flex items-center gap-2 text-sm text-slate-700 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200 cursor-pointer select-none" title="Si activas esto, los ítems de estas N.V. que NO vengan en el Excel se marcarán como CANCELADOS automáticamente.">
                                        <input
                                            type="checkbox"
                                            checked={syncDeleted}
                                            onChange={(e) => setSyncDeleted(e.target.checked)}
                                            className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                                        />
                                        <span>Sync: <strong>Cancelar</strong> lo que no venga</span>
                                    </label>
                                )}
                                <button
                                    onClick={() => parseData(rawText)}
                                    disabled={isParsing}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                                >
                                    {isParsing ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                                    Procesar Datos
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── STEP 2: PREVIEW ── */}
            {step === 'preview' && parsedRows.length > 0 && (
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    {/* Stats bar */}
                    <div className="flex gap-3">
                        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2">
                            <Database size={16} className="text-slate-400" />
                            <span className="text-sm font-medium text-slate-600">Total: <strong className="text-slate-800">{stats.total}</strong></span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-emerald-500" />
                            <span className="text-sm font-medium text-emerald-700">Nuevas: <strong>{stats.new}</strong></span>
                        </div>
                        {stats.update > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2">
                                <RefreshCw size={16} className="text-blue-500" />
                                <span className="text-sm font-medium text-blue-700">Actualizar: <strong>{stats.update}</strong></span>
                            </div>
                        )}
                        {stats.existing > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
                                <SkipForward size={16} className="text-amber-500" />
                                <span className="text-sm font-medium text-amber-700">Ya existen: <strong>{stats.existing}</strong></span>
                            </div>
                        )}
                        {stats.deleted > 0 && (
                            <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-2">
                                <Trash2 size={16} className="text-rose-500" />
                                <span className="text-sm font-medium text-rose-700">Eliminadas: <strong>{stats.deleted}</strong> (Ignoradas)</span>
                            </div>
                        )}
                        {stats.error > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                                <XCircle size={16} className="text-red-500" />
                                <span className="text-sm font-medium text-red-700">Errores: <strong>{stats.error}</strong></span>
                            </div>
                        )}
                        <div className="flex-1" />
                        <button
                            onClick={handleUpload}
                            disabled={isLoading || (stats.new === 0 && stats.update === 0)}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all disabled:shadow-none"
                        >
                            {isLoading ? (
                                <><Loader2 size={18} className="animate-spin" /> Cargando...</>
                            ) : (
                                <><Upload size={18} /> Cargar {stats.new + stats.update} {stats.new + stats.update === 1 ? 'registro' : 'registros'}</>
                            )}
                        </button>
                    </div>

                    {/* Tabla preview */}
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-auto flex-1">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider sticky top-0 z-10">
                                    <tr>
                                        <th className="px-3 py-2.5 font-medium w-10">#</th>
                                        <th className="px-3 py-2.5 font-medium w-16">Estado</th>
                                        {currentTab.columns.map(col => (
                                            <th key={col.key} className="px-3 py-2.5 font-medium whitespace-nowrap">
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {parsedRows.map((row, idx) => {
                                        const status = rowStatuses[idx] || 'new';
                                        const bgClass = {
                                            'new': 'bg-emerald-50/50',
                                            'update': 'bg-blue-50/50',
                                            'existing': 'bg-amber-50/50',
                                            'deleted': 'bg-rose-50/50',
                                            'loaded': 'bg-blue-50/50',
                                            'error': 'bg-red-50/50',
                                        }[status];
                                        const statusIcon = {
                                            'new': <CheckCircle size={14} className="text-emerald-500" />,
                                            'update': <RefreshCw size={14} className="text-blue-500" />,
                                            'existing': <SkipForward size={14} className="text-amber-500" />,
                                            'deleted': <Trash2 size={14} className="text-rose-500" />,
                                            'loaded': <Check size={14} className="text-blue-500" />,
                                            'error': <XCircle size={14} className="text-red-500" />,
                                        }[status];
                                        const statusLabel = {
                                            'new': 'Nueva',
                                            'update': 'Actualizar',
                                            'existing': 'Existe',
                                            'deleted': 'Eliminada',
                                            'loaded': 'Cargada',
                                            'error': 'Error',
                                        }[status];

                                        return (
                                            <tr key={idx} className={`${bgClass} hover:bg-slate-50 transition-colors`}>
                                                <td className="px-3 py-2 text-slate-400 text-xs">{idx + 1}</td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center gap-1" title={statusLabel}>
                                                        {statusIcon}
                                                        <span className="text-[10px] font-medium">{statusLabel}</span>
                                                    </div>
                                                </td>
                                                {currentTab.columns.map(col => (
                                                    <td key={col.key} className="px-3 py-2 text-slate-700 whitespace-nowrap max-w-[200px] truncate" title={String(row[col.key] || '')}>
                                                        {col.type === 'number' ? (
                                                            <span className="font-mono">{row[col.key]}</span>
                                                        ) : (
                                                            row[col.key] || <span className="text-slate-300">-</span>
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
                <div className="flex-1 flex items-center justify-center">
                    <div className="max-w-lg w-full text-center">
                        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${loadResult.success ? 'bg-emerald-100' : 'bg-red-100'
                            }`}>
                            {loadResult.success ? (
                                <CheckCircle size={48} className="text-emerald-500" />
                            ) : (
                                <AlertCircle size={48} className="text-red-500" />
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            {loadResult.success ? '¡Carga Completada!' : 'Error en la Carga'}
                        </h2>
                        <p className="text-slate-600 mb-6">{loadResult.message}</p>

                        {/* Stats cards */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                <p className="text-3xl font-black text-emerald-600">{loadResult.inserted}</p>
                                <p className="text-xs font-medium text-emerald-700">Cargados</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <p className="text-3xl font-black text-amber-600">{loadResult.skipped}</p>
                                <p className="text-xs font-medium text-amber-700">Ignorados</p>
                                {stats.deleted > 0 && <p className="text-[10px] text-rose-500 mt-1">({stats.deleted} eliminados prev.)</p>}
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-3xl font-black text-red-600">{loadResult.errors}</p>
                                <p className="text-xs font-medium text-red-700">Errores</p>
                            </div>
                        </div>

                        {loadResult.errorDetails?.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-6">
                                <p className="text-xs font-bold text-red-800 mb-2">Detalle de errores:</p>
                                {loadResult.errorDetails.map((e, i) => (
                                    <p key={i} className="text-xs text-red-600 font-mono">{e}</p>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            {loadResult.success ? (
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all"
                                >
                                    <RefreshCw size={16} className="inline mr-2" />
                                    Nueva Carga
                                </button>
                            ) : (
                                <button
                                    onClick={() => setStep('paste')}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg transition-all"
                                >
                                    <XCircle size={16} className="inline mr-2" />
                                    Cerrar Error e Intentar Nuevamente
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
