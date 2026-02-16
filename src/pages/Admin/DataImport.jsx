// DataImport.jsx - Módulo de Carga Masiva de Datos (elimina cuello de botella Google Sheets)
import React, { useState, useRef, useCallback } from 'react';
import {
    Upload, FileText, Layers, Barcode, Package, ClipboardPaste,
    CheckCircle, XCircle, AlertCircle, Loader2, Trash2, Download,
    ArrowRight, SkipForward, RefreshCw, Database, Check, X, Info
} from 'lucide-react';
import { supabase } from '../../supabase';

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
        uniqueKey: 'nv, codigo_producto', // Campo clave para deduplicación (combinado)
        defaultValues: { estado: 'Pendiente' },
        columns: [
            { key: 'fecha_emision', label: 'Fecha', required: false, type: 'date' },
            { key: 'nv', label: 'N.Venta', required: true, type: 'text' },
            { key: 'estado_erp', label: 'Estado', required: false, type: 'text' },
            { key: 'cod_cliente', label: 'Cod.Cliente', required: false, type: 'text' },
            { key: 'cliente', label: 'Nombre Cliente', required: true, type: 'text' },
            { key: 'cod_vendedor', label: 'Cod.Vendedor', required: false, type: 'text' },
            { key: 'vendedor', label: 'Nombre Vendedor', required: false, type: 'text' },
            { key: 'zona', label: 'Zona', required: false, type: 'text' },
            { key: 'codigo_producto', label: 'Cod.Producto', required: true, type: 'text' },
            { key: 'descripcion_producto', label: 'Descripcion Producto', required: false, type: 'text' },
            { key: 'unidad', label: 'Unidad Medida', required: false, type: 'text' },
            { key: 'cantidad', label: 'Pedido', required: true, type: 'number' },
        ],
        helpText: '💡 Pega TODAS las N.V — el sistema detecta automáticamente cuáles son NUEVAS y solo carga esas. Las que ya existen se ignoran sin cambiar su estado.',
        smartDedup: true, // Activar deduplicación inteligente
    },
    {
        id: 'partidas',
        label: 'Partidas',
        icon: Layers,
        color: 'blue',
        table: 'tms_partidas',
        uniqueKey: 'codigo_producto,partida', // Upsert por combinación
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
        ],
        helpText: '📦 Pega los datos de partidas. Se reemplazarán los registros existentes del mismo código+partida.',
        smartDedup: false,
    },
    {
        id: 'series',
        label: 'Series',
        icon: Barcode,
        color: 'violet',
        table: 'tms_series',
        uniqueKey: 'serie', // Upsert por serie (única)
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
        helpText: '🔢 Pega los datos de series. Se reemplazarán los registros existentes de la misma serie.',
        smartDedup: false,
    },
    {
        id: 'farmapack',
        label: 'Farmapack',
        icon: Package,
        color: 'emerald',
        table: 'tms_farmapack',
        uniqueKey: 'codigo_producto,lote', // Upsert por combinación
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
        ],
        helpText: '💊 Pega los datos de Farmapack. Se reemplazarán los registros existentes del mismo código+lote.',
        smartDedup: false,
    }
];

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
const DataImport = () => {
    const [activeTab, setActiveTab] = useState('nv');
    const [rawText, setRawText] = useState('');
    const [parsedRows, setParsedRows] = useState([]);
    const [rowStatuses, setRowStatuses] = useState([]); // 'new' | 'existing' | 'error' | 'loaded'
    const [isParsing, setIsParsing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadResult, setLoadResult] = useState(null);
    const [step, setStep] = useState('paste'); // 'paste' | 'preview' | 'done'
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

            currentTab.columns.forEach((col, idx) => {
                let value = cells[idx] || '';

                // Limpiar y convertir tipos
                if (col.type === 'number') {
                    value = value.replace(/[^\d.,\-]/g, '').replace(',', '.');
                    value = parseFloat(value) || 0;
                } else if (col.type === 'date') {
                    // Intentar parsear fecha
                    if (value) {
                        // Formatos comunes: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
                        const dateMatch = value.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
                        if (dateMatch) {
                            const [_, d, m, y] = dateMatch;
                            const year = y.length === 2 ? `20${y}` : y;
                            value = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                        } else if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                             // Si NO coincide con formato fecha ni ISO, asumir que es basura (ej: "UNI") y enviar null
                             value = null;
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
                // Obtener las claves únicas del paste
                const keys = [...new Set(rows.map(r => r[currentTab.uniqueKey]).filter(Boolean))];

                // Consultar cuáles ya existen en Supabase
                const { data: existing, error } = await supabase
                    .from(currentTab.table)
                    .select(currentTab.uniqueKey)
                    .in(currentTab.uniqueKey, keys);

                if (error) throw error;

                const existingKeys = new Set((existing || []).map(r => r[currentTab.uniqueKey]?.toString()));

                // Marcar cada fila
                const statuses = rows.map(row => {
                    const key = row[currentTab.uniqueKey]?.toString();
                    if (!key) return 'error';
                    return existingKeys.has(key) ? 'existing' : 'new';
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
    }, [currentTab]);

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
            // Filtrar solo las filas NUEVAS (no existentes)
            const newRows = parsedRows.filter((_, idx) => rowStatuses[idx] === 'new');

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

            // Insertar en lotes de 100
            const BATCH_SIZE = 100;
            let inserted = 0;
            let errors = 0;
            const errorDetails = [];

            console.log(`Iniciando carga a ${currentTab.table}. Estrategia: ${currentTab.smartDedup ? 'INSERT (Ignorar Duplicados)' : 'UPSERT (Actualizar)'}`, {
                uniqueKey: currentTab.uniqueKey,
                ignoreDuplicates: currentTab.smartDedup
            });

            for (let i = 0; i < newRows.length; i += BATCH_SIZE) {
                const batch = newRows.slice(i, i + BATCH_SIZE);

                const { data, error } = await supabase
                    .from(currentTab.table)
                    .upsert(batch, {
                        onConflict: currentTab.uniqueKey || undefined,
                        ignoreDuplicates: currentTab.smartDedup
                    });

                if (error) {
                    console.error('Error en batch:', error);
                    errors += batch.length;
                    errorDetails.push(error.message);
                } else {
                    inserted += batch.length;
                }
            }

            // Actualizar estados de las filas cargadas
            const updatedStatuses = [...rowStatuses];
            let newIdx = 0;
            parsedRows.forEach((_, idx) => {
                if (rowStatuses[idx] === 'new') {
                    updatedStatuses[idx] = newIdx < inserted ? 'loaded' : 'error';
                    newIdx++;
                }
            });
            setRowStatuses(updatedStatuses);

            const skipped = parsedRows.length - newRows.length;

            setLoadResult({
                success: errors === 0,
                total: parsedRows.length,
                inserted,
                skipped,
                errors,
                errorDetails,
                message: errors === 0
                    ? `✅ ${inserted} registros cargados exitosamente${skipped > 0 ? ` (${skipped} existentes ignorados)` : ''}`
                    : `⚠️ ${inserted} cargados, ${errors} con error${skipped > 0 ? `, ${skipped} ignorados` : ''}`
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
        existing: rowStatuses.filter(s => s === 'existing').length,
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
                    <div className={`bg-${currentTab.color === 'indigo' ? 'indigo' : currentTab.color === 'blue' ? 'blue' : currentTab.color === 'violet' ? 'violet' : 'emerald'}-50 border border-${currentTab.color}-200 rounded-xl p-4 flex items-start gap-3`}>
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
                            <button
                                onClick={() => parseData(rawText)}
                                disabled={isParsing}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                            >
                                {isParsing ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                                Procesar Datos
                            </button>
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
                        {stats.existing > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
                                <SkipForward size={16} className="text-amber-500" />
                                <span className="text-sm font-medium text-amber-700">Ya existen: <strong>{stats.existing}</strong></span>
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
                            disabled={isLoading || stats.new === 0}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all disabled:shadow-none"
                        >
                            {isLoading ? (
                                <><Loader2 size={18} className="animate-spin" /> Cargando...</>
                            ) : (
                                <><Upload size={18} /> Cargar {stats.new} {stats.new === 1 ? 'registro' : 'registros'}</>
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
                                            'existing': 'bg-amber-50/50',
                                            'loaded': 'bg-blue-50/50',
                                            'error': 'bg-red-50/50',
                                        }[status];
                                        const statusIcon = {
                                            'new': <CheckCircle size={14} className="text-emerald-500" />,
                                            'existing': <SkipForward size={14} className="text-amber-500" />,
                                            'loaded': <Check size={14} className="text-blue-500" />,
                                            'error': <XCircle size={14} className="text-red-500" />,
                                        }[status];
                                        const statusLabel = {
                                            'new': 'Nueva',
                                            'existing': 'Existe',
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

                        <button
                            onClick={handleReset}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all"
                        >
                            <RefreshCw size={16} className="inline mr-2" />
                            Nueva Carga
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataImport;
