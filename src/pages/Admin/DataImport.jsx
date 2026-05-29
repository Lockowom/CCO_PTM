import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
    Upload, FileText, Layers, Barcode, Package, ClipboardPaste,
    CheckCircle, XCircle, AlertCircle, Loader2, Trash2,
    ArrowRight, SkipForward, RefreshCw, Database, Check, X, Info, Truck,
    ChevronDown, Box, FileSpreadsheet, Tag, Settings, Shield, Save,
    Camera, QrCode, ScanLine, Plus, Minus
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import useBarcodeScanner from '../../hooks/useBarcodeScanner';

// ── CONFIGURACIÓN DE TABS ──
const IMPORT_TABS = [
    {
        id: 'inventario_general', label: 'Consolidado', category: 'inventario',
        icon: Layers, table: 'tms_inventario_general',
        uniqueKey: 'bodega,codigo_producto',
        columns: [
            { key: 'bodega', label: 'Bodega', required: true, type: 'text' },
            { key: 'codigo_producto', label: 'Cod. Producto', required: true, type: 'text' },
            { key: 'producto', label: 'Producto', required: false, type: 'text' },
            { key: 'unidad_medida', label: 'Cod. U. Medida', required: false, type: 'text' },
            { key: 'disponible', label: 'Disponible', required: false, type: 'number' },
            { key: 'reserva', label: 'Reserva', required: false, type: 'number' },
            { key: 'transitoria', label: 'Transitoria', required: false, type: 'number' },
            { key: 'consignacion', label: 'Consignación', required: false, type: 'number' },
            { key: 'stock_total', label: 'Stock Total', required: false, type: 'number' },
        ],
        helpText: 'Ingresa el inventario consolidado. Incluye la columna "Bodega" (ej. BD 21). Si el registro ya existe, se actualizará.',
        smartDedup: false,
    },
    ...['BD 21', 'BD 5', 'BD 24', 'BD 3', 'BD 7', 'BD 99', 'BD 22'].map(bodega => ({
        id: `inv_${bodega.replace(' ', '').toLowerCase()}`,
        label: `${bodega}`, category: 'inventario',
        icon: Package, table: 'tms_inventario_general',
        uniqueKey: 'bodega,codigo_producto',
        defaultValues: { bodega },
        columns: [
            { key: 'codigo_producto', label: 'Cod. Producto', required: true, type: 'text' },
            { key: 'producto', label: 'Producto', required: false, type: 'text' },
            { key: 'unidad_medida', label: 'Cod. U. Medida', required: false, type: 'text' },
            { key: 'disponible', label: 'Disponible', required: false, type: 'number' },
            { key: 'reserva', label: 'Reserva', required: false, type: 'number' },
            { key: 'transitoria', label: 'Transitoria', required: false, type: 'number' },
            { key: 'consignacion', label: 'Consignación', required: false, type: 'number' },
            { key: 'stock_total', label: 'Stock Total', required: false, type: 'number' },
        ],
        helpText: `Inventario de ${bodega}. La bodega se asigna automáticamente. Si el producto ya existe, se actualizará.`,
        smartDedup: false,
    })),
    {
        id: 'nv', label: 'N.V Diarias', category: 'ventas',
        icon: FileText, table: 'tms_nv_diarias',
        uniqueKey: 'nv,codigo_producto',
        defaultValues: { estado: 'Pendiente' },
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
        helpText: 'Pega TODAS las N.V. El sistema detecta cuáles son nuevas. Las eliminadas manualmente no se recargan.',
        smartDedup: true, allowUpdate: true,
    },
    {
        id: 'control_despacho', label: 'Control Despacho', category: 'ventas',
        icon: Truck, table: 'tms_control_despacho',
        uniqueKey: null,
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
        helpText: 'Pega la planilla de Control de Despacho. Se insertan todos los registros sin validar duplicados.',
        smartDedup: false,
    },
    {
        id: 'partidas', label: 'Partidas', category: 'trazabilidad',
        icon: Layers, table: 'tms_partidas',
        uniqueKey: 'codigo_producto, partida',
        columns: [
            { key: 'codigo_producto', label: 'Cod. Producto', required: true, type: 'text' },
            { key: 'producto', label: 'Producto', required: false, type: 'text' },
            { key: 'unidad_medida', label: 'Cod. U. Medida', required: false, type: 'text' },
            { key: 'partida', label: 'Partida / Talla', required: true, type: 'text' },
            { key: 'fecha_vencimiento', label: 'Fecha Venc', required: false, type: 'date' },
            { key: 'disponible', label: 'Disponible', required: false, type: 'number' },
            { key: 'reserva', label: 'Reserva', required: false, type: 'number' },
            { key: 'transitoria', label: 'Transitoria', required: false, type: 'number' },
            { key: 'consignacion', label: 'Consignación', required: false, type: 'number' },
            { key: 'stock_total', label: 'Stock Total', required: false, type: 'number' },
        ],
        helpText: 'Pega las columnas en el orden indicado para actualizar el stock por lote/talla.',
        smartDedup: false,
    },
    {
        id: 'series', label: 'Series', category: 'trazabilidad',
        icon: Barcode, table: 'tms_series',
        uniqueKey: 'serie',
        columns: [
            { key: 'codigo_producto', label: 'Cod. Producto', required: true, type: 'text' },
            { key: 'producto', label: 'Producto', required: false, type: 'text' },
            { key: 'unidad_medida', label: 'Cod. U. Medida', required: false, type: 'text' },
            { key: 'serie', label: 'Serie', required: true, type: 'text' },
            { key: 'disponible', label: 'Disponible', required: false, type: 'number' },
            { key: 'reserva', label: 'Reserva', required: false, type: 'number' },
            { key: 'transitoria', label: 'Transitoria', required: false, type: 'number' },
            { key: 'consignacion', label: 'Consignación', required: false, type: 'number' },
            { key: 'stock_total', label: 'Stock Total', required: false, type: 'number' },
        ],
        helpText: 'La columna "Serie" debe ser única para cada registro.',
        smartDedup: false,
    },
    {
        id: 'farmapack', label: 'Farmapack', category: 'trazabilidad',
        icon: Package, table: 'tms_farmapack',
        uniqueKey: 'codigo_producto, lote',
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
        helpText: 'Registros con el mismo código y lote serán actualizados.',
        smartDedup: false,
    },
    {
        id: 'inventario', label: 'Inventario WMS', category: 'wms',
        icon: Database, table: 'wms_ubicaciones',
        uniqueKey: null,
        defaultValues: { cantidad: 1 },
        columns: [
            { key: 'ubicacion', label: 'UBICACION', required: true, type: 'text' },
            { key: 'codigo', label: 'CODIGO', required: true, type: 'text' },
            { key: 'descripcion', label: 'DESCRIPCION', required: false, type: 'text' },
        ],
        helpText: 'Orden: UBICACION | CODIGO | DESCRIPCION. Cantidad se asigna como 1 automáticamente.',
        smartDedup: false,
    },
    {
        id: 'matriz_codigos', label: 'Matriz Códigos', category: 'maestros',
        icon: Barcode, table: 'tms_matriz_codigos',
        uniqueKey: 'codigo_producto',
        columns: [
            { key: 'codigo_producto', label: 'Cod. Producto', required: true, type: 'text' },
            { key: 'producto', label: 'Producto', required: true, type: 'text' },
            { key: 'unidad_medida', label: 'Cod. U. Medida', required: false, type: 'text' },
        ],
        helpText: 'Maestro de códigos. Si el código ya existe, se actualiza la información.',
        smartDedup: false,
    },
];

const CATEGORIES = [
    { id: 'inventario', label: 'Inventario', icon: Box, color: 'blue' },
    { id: 'ventas', label: 'Ventas / Despacho', icon: FileSpreadsheet, color: 'emerald' },
    { id: 'trazabilidad', label: 'Trazabilidad', icon: Barcode, color: 'violet' },
    { id: 'wms', label: 'WMS', icon: Database, color: 'orange' },
    { id: 'maestros', label: 'Maestros', icon: Tag, color: 'slate' },
];

const CATEGORY_COLORS = {
    blue: { active: 'bg-blue-50 border-blue-200 text-blue-700', dot: 'bg-blue-500' },
    emerald: { active: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500' },
    violet: { active: 'bg-violet-50 border-violet-200 text-violet-700', dot: 'bg-violet-500' },
    orange: { active: 'bg-orange-50 border-orange-200 text-orange-700', dot: 'bg-orange-500' },
    slate: { active: 'bg-slate-100 border-slate-300 text-slate-700', dot: 'bg-slate-500' },
};

const SCAN_FIELD_MAP = {
    inventario_general: 'codigo_producto',
    nv: 'codigo_producto',
    control_despacho: 'guia',
    partidas: 'codigo_producto',
    series: 'serie',
    farmapack: 'codigo_producto',
    inventario: 'codigo',
    matriz_codigos: 'codigo_producto',
};

const FULL_ACCESS_ROLES = ['ADMIN', 'ADMIN_DEV'];

const ALL_TAB_IDS = IMPORT_TABS.map(t => t.id);

// ── PANEL ADMIN: Configuración de acceso por rol ──
const AccessConfigPanel = ({ onClose }) => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [saved, setSaved] = useState(null);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.from('tms_roles').select('id, nombre, import_tabs').order('nombre');
            setRoles((data || []).filter(r => !FULL_ACCESS_ROLES.includes(r.id)));
            setLoading(false);
        })();
    }, []);

    const toggleTab = (roleId, tabId) => {
        setRoles(prev => prev.map(r => {
            if (r.id !== roleId) return r;
            const current = Array.isArray(r.import_tabs) ? r.import_tabs : [];
            const next = current.includes(tabId) ? current.filter(t => t !== tabId) : [...current, tabId];
            return { ...r, import_tabs: next };
        }));
    };

    const toggleAll = (roleId) => {
        setRoles(prev => prev.map(r => {
            if (r.id !== roleId) return r;
            const current = Array.isArray(r.import_tabs) ? r.import_tabs : [];
            const next = current.length === ALL_TAB_IDS.length ? [] : [...ALL_TAB_IDS];
            return { ...r, import_tabs: next };
        }));
    };

    const saveRole = async (role) => {
        setSaving(role.id);
        const { error } = await supabase.from('tms_roles').update({ import_tabs: role.import_tabs }).eq('id', role.id);
        setSaving(null);
        if (!error) { setSaved(role.id); setTimeout(() => setSaved(null), 2000); }
    };

    const groupedTabs = useMemo(() => CATEGORIES.map(cat => ({
        ...cat, tabs: IMPORT_TABS.filter(t => t.category === cat.id)
    })), []);

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center"><Shield size={18} /></div>
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900">Acceso por Rol</h2>
                            <p className="text-[10px] text-slate-400 font-medium">Configura qué módulos de carga puede usar cada rol</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors"><X size={16} /></button>
                </div>

                <div className="flex-1 overflow-auto p-3 sm:p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
                    ) : (
                        <div className="space-y-4">
                            {roles.map(role => {
                                const tabs = Array.isArray(role.import_tabs) ? role.import_tabs : [];
                                const allSelected = tabs.length === ALL_TAB_IDS.length;
                                return (
                                    <div key={role.id} className="border border-slate-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-900">{role.nombre}</span>
                                                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{role.id}</span>
                                                {tabs.length > 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{tabs.length} tabs</span>}
                                                {tabs.length === 0 && <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">Sin acceso</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => toggleAll(role.id)} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                                    {allSelected ? 'Quitar todo' : 'Seleccionar todo'}
                                                </button>
                                                <button
                                                    onClick={() => saveRole(role)}
                                                    disabled={saving === role.id}
                                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${saved === role.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-800 text-white hover:bg-slate-700'} disabled:opacity-50`}
                                                >
                                                    {saving === role.id ? <Loader2 size={12} className="animate-spin" /> : saved === role.id ? <Check size={12} /> : <Save size={12} />}
                                                    {saved === role.id ? 'Guardado' : 'Guardar'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {groupedTabs.map(cat => (
                                                <div key={cat.id} className="flex items-start gap-3">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-24 pt-1 shrink-0">{cat.label}</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {cat.tabs.map(tab => {
                                                            const isOn = tabs.includes(tab.id);
                                                            return (
                                                                <button
                                                                    key={tab.id}
                                                                    onClick={() => toggleTab(role.id, tab.id)}
                                                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border ${isOn ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                                                >
                                                                    {tab.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── COMPONENTE PRINCIPAL ──
const DataImport = () => {
    const { user } = useAuth();
    const [importTabsConfig, setImportTabsConfig] = useState(null);
    const [showAccessConfig, setShowAccessConfig] = useState(false);

    const isFullAccess = FULL_ACCESS_ROLES.includes(user?.rol);

    useEffect(() => {
        if (!user?.rol) return;
        if (isFullAccess) { setImportTabsConfig('*'); return; }

        (async () => {
            const { data } = await supabase.from('tms_roles').select('import_tabs').eq('id', user.rol).single();
            setImportTabsConfig(data?.import_tabs ?? []);
        })();
    }, [user?.rol, isFullAccess]);

    const accessibleTabs = useMemo(() => {
        if (importTabsConfig === null) return [];
        if (importTabsConfig === '*' || isFullAccess) return IMPORT_TABS;
        if (!Array.isArray(importTabsConfig)) return [];
        return IMPORT_TABS.filter(t => importTabsConfig.includes(t.id));
    }, [importTabsConfig, isFullAccess]);

    const visibleCategories = useMemo(() => {
        const catIds = new Set(accessibleTabs.map(t => t.category));
        return CATEGORIES.filter(c => catIds.has(c.id));
    }, [accessibleTabs]);

    const defaultCategory = visibleCategories[0]?.id || 'ventas';
    const defaultTab = accessibleTabs[0]?.id || 'nv';

    const [activeTab, setActiveTab] = useState(defaultTab);
    const [activeCategory, setActiveCategory] = useState(defaultCategory);
    const [rawText, setRawText] = useState('');
    const [parsedRows, setParsedRows] = useState([]);
    const [rowStatuses, setRowStatuses] = useState([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadResult, setLoadResult] = useState(null);
    const [step, setStep] = useState('paste');
    const [skipFirstColumn, setSkipFirstColumn] = useState(false);
    const [syncDeleted, setSyncDeleted] = useState(false);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const [inputMode, setInputMode] = useState('paste'); // 'paste' | 'scan'
    const [scannedItems, setScannedItems] = useState([]);
    const [scanError, setScanError] = useState('');
    const [manualScanValue, setManualScanValue] = useState('');
    const { startScan, isScanning, isSupportedDevice } = useBarcodeScanner();

    // Sync defaults when config loads
    useEffect(() => {
        if (accessibleTabs.length > 0 && !accessibleTabs.find(t => t.id === activeTab)) {
            const firstCat = visibleCategories[0]?.id;
            const firstTab = accessibleTabs[0]?.id;
            if (firstCat) setActiveCategory(firstCat);
            if (firstTab) setActiveTab(firstTab);
        }
    }, [accessibleTabs]);

    const currentTab = IMPORT_TABS.find(t => t.id === activeTab);

    const categoryTabs = useMemo(() =>
        accessibleTabs.filter(t => t.category === activeCategory),
    [accessibleTabs, activeCategory]);

    // ── PARSEAR TEXTO ──
    const parseData = useCallback(async (text) => {
        if (!text.trim()) return;
        setIsParsing(true);

        const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) { setIsParsing(false); return; }

        const firstLine = lines[0];
        const separator = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

        const firstCells = firstLine.split(separator).map(c => c.trim());
        const isHeader = currentTab.columns.some(col =>
            firstCells.some(cell =>
                cell.toLowerCase().replace(/[^a-z0-9]/g, '') === col.label.toLowerCase().replace(/[^a-z0-9]/g, '') ||
                cell.toLowerCase().replace(/[^a-z0-9]/g, '') === col.key.toLowerCase().replace(/[^a-z0-9]/g, '')
            )
        );
        const dataLines = isHeader ? lines.slice(1) : lines;

        const rows = dataLines.map(line => {
            const cells = line.split(separator).map(c => c.trim());
            const row = {};
            let cellIdx = 0;

            currentTab.columns.forEach((col) => {
                let value = '';
                if (activeTab === 'nv' && skipFirstColumn && col.key === 'fecha_emision') {
                    value = null;
                } else {
                    value = cells[cellIdx] || '';
                    cellIdx++;
                }

                if (col.type === 'number') {
                    value = value.replace(/[^\d.,\-]/g, '').replace(',', '.');
                    value = parseFloat(value) || 0;
                } else if (col.type === 'date') {
                    if (value && value.trim() !== '') {
                        if (value.length < 6 || !/\d/.test(value)) {
                            value = null;
                        } else {
                            value = value.split(' ')[0];
                            const dateMatch = value.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
                            if (dateMatch) {
                                const [_, d, m, y] = dateMatch;
                                const year = y.length === 2 ? `20${y}` : y;
                                const isoDate = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                                const dateObj = new Date(year, parseInt(m) - 1, d);
                                if (dateObj.getFullYear() == year && dateObj.getMonth() == parseInt(m) - 1 && dateObj.getDate() == d) {
                                    value = isoDate;
                                } else { value = null; }
                            } else {
                                const timestamp = Date.parse(value);
                                if (!isNaN(timestamp)) {
                                    const d = new Date(timestamp);
                                    const yr = d.getFullYear();
                                    if (yr > 1900 && yr < 2100) { value = d.toISOString().split('T')[0]; }
                                    else { value = null; }
                                } else { value = null; }
                            }
                        }
                    } else { value = null; }
                } else {
                    value = value.toString().trim();
                }
                row[col.key] = value;
            });

            if (currentTab.defaultValues) {
                Object.entries(currentTab.defaultValues).forEach(([k, v]) => {
                    if (!row[k]) row[k] = v;
                });
            }
            return row;
        }).filter(row =>
            currentTab.columns.filter(c => c.required).some(c => row[c.key] && row[c.key] !== '' && row[c.key] !== 0)
        );

        setParsedRows(rows);

        // Deduplicación inteligente (optimizada con paginación paralela)
        if (currentTab.smartDedup && currentTab.uniqueKey && rows.length > 0) {
            try {
                const keysDef = currentTab.uniqueKey.split(',').map(k => k.trim());
                const firstKey = keysDef[0];
                const firstKeyValues = [...new Set(rows.map(r => r[firstKey]).filter(Boolean))];
                const selectFields = keysDef.join(',');

                // Paginar en chunks de 500 keys para evitar URLs gigantes y timeouts
                const KEY_CHUNK = 500;
                const keyChunks = [];
                for (let i = 0; i < firstKeyValues.length; i += KEY_CHUNK) {
                    keyChunks.push(firstKeyValues.slice(i, i + KEY_CHUNK));
                }

                // Queries en paralelo: existing + deleted (si aplica)
                const existingPromises = keyChunks.map(chunk =>
                    supabase.from(currentTab.table).select(selectFields).in(firstKey, chunk).limit(chunk.length)
                );

                const deletedPromises = currentTab.id === 'nv'
                    ? keyChunks.map(chunk => supabase.from('tms_nv_eliminadas').select(firstKey).in(firstKey, chunk))
                    : [];

                const [existingResults, deletedResults] = await Promise.all([
                    Promise.all(existingPromises),
                    deletedPromises.length > 0 ? Promise.all(deletedPromises) : Promise.resolve([])
                ]);

                const existingKeys = new Set();
                existingResults.forEach(res => {
                    (res.data || []).forEach(r => {
                        existingKeys.add(keysDef.map(k => r[k]?.toString().trim().toUpperCase()).join('|'));
                    });
                });

                const deletedKeys = new Set();
                deletedResults.forEach(res => {
                    (res.data || []).forEach(d => {
                        const val = d[firstKey]?.toString().trim().toUpperCase();
                        if (val) deletedKeys.add(val);
                    });
                });

                const statuses = rows.map(row => {
                    const fkVal = row[firstKey]?.toString().trim().toUpperCase();
                    if (!fkVal) return 'error';
                    if (deletedKeys.has(fkVal)) return 'deleted';
                    const rowKey = keysDef.map(k => row[k]?.toString().trim().toUpperCase()).join('|');
                    if (existingKeys.has(rowKey)) return currentTab.allowUpdate ? 'update' : 'existing';
                    return 'new';
                });
                setRowStatuses(statuses);
            } catch (_) { console.error('Row status check error:', _); setRowStatuses(rows.map(() => 'new')); }
        } else {
            setRowStatuses(rows.map(() => 'new'));
        }

        setStep('preview');
        setIsParsing(false);
    }, [currentTab, skipFirstColumn, activeTab]);

    const handlePaste = (e) => {
        const text = e.clipboardData?.getData('text/plain') || '';
        if (text) { setRawText(text); parseData(text); }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { const text = ev.target.result; setRawText(text); parseData(text); };
        reader.readAsText(file);
    };

    // ── ESCANEO QR / CÓDIGO DE BARRAS ──
    const getScanField = () => {
        if (!currentTab) return 'codigo_producto';
        const tabId = currentTab.id.startsWith('inv_') ? 'inventario_general' : currentTab.id;
        return SCAN_FIELD_MAP[tabId] || currentTab.columns.find(c => c.required)?.key || currentTab.columns[0]?.key;
    };

    const enrichWithProductInfo = async (code) => {
        try {
            const { data } = await supabase
                .from('tms_matriz_codigos')
                .select('codigo_producto, producto, unidad_medida')
                .eq('codigo_producto', code)
                .maybeSingle();
            return data || null;
        } catch { return null; }
    };

    const addScannedItem = useCallback(async (rawValue) => {
        if (!rawValue || !currentTab) return;
        setScanError('');

        const scanField = getScanField();
        const row = {};

        if (currentTab.defaultValues) {
            Object.entries(currentTab.defaultValues).forEach(([k, v]) => { row[k] = v; });
        }

        const hasSeparator = rawValue.includes('\t') || rawValue.includes('|') || rawValue.includes(';');
        if (hasSeparator) {
            const sep = rawValue.includes('\t') ? '\t' : rawValue.includes('|') ? '|' : ';';
            const parts = rawValue.split(sep).map(s => s.trim());
            currentTab.columns.forEach((col, idx) => {
                if (parts[idx]) row[col.key] = parts[idx];
            });
        } else {
            row[scanField] = rawValue.trim();
        }

        const codeField = row.codigo_producto || row.codigo;
        if (codeField && !row.producto) {
            const productInfo = await enrichWithProductInfo(codeField);
            if (productInfo) {
                if (!row.producto) row.producto = productInfo.producto;
                if (!row.unidad_medida) row.unidad_medida = productInfo.unidad_medida;
            }
        }

        setScannedItems(prev => [...prev, { ...row, _scannedAt: Date.now(), _rawValue: rawValue }]);
    }, [currentTab]);

    const handleCameraScan = useCallback(async () => {
        setScanError('');
        const value = await startScan({
            onError: (msg) => setScanError(msg),
        });
        if (value) await addScannedItem(value);
    }, [startScan, addScannedItem]);

    const handleManualScan = useCallback(async () => {
        if (!manualScanValue.trim()) return;
        await addScannedItem(manualScanValue.trim());
        setManualScanValue('');
    }, [manualScanValue, addScannedItem]);

    const removeScannedItem = (index) => {
        setScannedItems(prev => prev.filter((_, i) => i !== index));
    };

    const processScannedItems = useCallback(() => {
        if (scannedItems.length === 0) return;
        const rows = scannedItems.map(item => {
            const row = { ...item };
            delete row._scannedAt;
            delete row._rawValue;
            return row;
        });

        setParsedRows(rows);
        setRowStatuses(rows.map(() => 'new'));
        setStep('preview');
    }, [scannedItems]);

    // ── CARGAR A SUPABASE (OPTIMIZADO: RPC bulk + paralelo) ──
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

    const handleUpload = async () => {
        if (parsedRows.length === 0) return;
        setIsLoading(true);
        setLoadResult(null);
        setUploadProgress({ current: 0, total: 0 });

        try {
            let newRows = parsedRows.filter((_, idx) => rowStatuses[idx] === 'new' || rowStatuses[idx] === 'update');

            if (newRows.length === 0) {
                setLoadResult({ success: true, total: parsedRows.length, inserted: 0, skipped: parsedRows.length, errors: 0, deduplicated: 0, message: 'No hay registros nuevos. Todos ya existen.' });
                setStep('done'); setIsLoading(false); return;
            }

            const errorDetails = [];

            if (currentTab.id === 'nv' && newRows.length > 0) {
                try {
                    const litePayload = newRows.map(r => ({ nv: r.nv?.toString(), codigo_producto: r.codigo_producto?.toString(), cantidad: r.cantidad, cliente: r.cliente }));
                    const { data: prepData, error: prepError } = await supabase.rpc('prepare_nv_import', { payload: litePayload, sync_deleted: syncDeleted });
                    if (prepError) { errorDetails.push(`Advertencia: ${prepError.message}`); }
                    else if (prepData) {
                        if (prepData.reseteadas > 0) errorDetails.push(`Se reiniciaron ${prepData.reseteadas} N.V. en proceso.`);
                        if (prepData.items_cancelados > 0) errorDetails.push(`Se cancelaron ${prepData.items_cancelados} ítems faltantes.`);
                    }
                } catch (_) { console.error('Record upsert error:', _); }
            }

            // ── DEDUP GLOBAL (antes de batching) ──
            let deduplicated = 0;
            if (currentTab.uniqueKey) {
                const keys = currentTab.uniqueKey.split(',').map(k => k.trim());
                const uniqueMap = new Map();
                newRows.forEach(row => {
                    const key = keys.map(k => (row[k] || '').toString().trim()).join('|');
                    if (key && key !== '|' && key !== '') {
                        uniqueMap.set(key, row); // last wins
                    }
                });
                const beforeCount = newRows.length;
                newRows = Array.from(uniqueMap.values());
                deduplicated = beforeCount - newRows.length;
                if (deduplicated > 0) {
                    errorDetails.push(`${deduplicated} filas duplicadas consolidadas (misma clave: ${currentTab.uniqueKey})`);
                }
            }

            // Liberar memoria del textarea si el dataset es grande
            if (parsedRows.length > 5000) setRawText('');

            let inserted = 0, errors = 0;
            const conflictKeys = (!currentTab.uniqueKey || currentTab.id === 'control_despacho') ? null : currentTab.uniqueKey;

            // ── SIEMPRE usar RPC bulk_upsert (SECURITY DEFINER = bypasea RLS) ──
            // Set-based en el server; chunks de 1000 con timeout por lote.
            // El progreso se actualiza POR LOTE a medida que cada uno termina
            // (1/5, 2/5, …) para que nunca se perciba "pegado en 0/N".
            const RPC_CHUNK = 1000;
            const CONCURRENCY = 2;
            const CHUNK_TIMEOUT_MS = 60000;
            const rpcChunks = [];
            for (let i = 0; i < newRows.length; i += RPC_CHUNK) {
                rpcChunks.push(newRows.slice(i, i + RPC_CHUNK));
            }

            const totalChunks = rpcChunks.length;
            let completedChunks = 0;
            setUploadProgress({ current: 0, total: totalChunks });

            // Procesa un lote con abort/timeout y actualiza progreso al terminar.
            const runChunk = async (chunk, chunkNum) => {
                const ctrl = new AbortController();
                const tid = setTimeout(() => ctrl.abort(), CHUNK_TIMEOUT_MS);
                try {
                    const { data, error } = await supabase
                        .rpc('bulk_upsert', {
                            p_table: currentTab.table,
                            p_data: chunk,
                            p_conflict_keys: conflictKeys
                        })
                        .abortSignal(ctrl.signal);
                    if (error) throw error;
                    inserted += data?.inserted || 0;
                    errors += data?.errors || 0;
                    if (data?.error) errorDetails.push(`Lote ${chunkNum}: ${data.error}`);
                    else if (data?.errors > 0) errorDetails.push(`Lote ${chunkNum}: ${data.errors} errores server-side`);
                } catch (e) {
                    errors += chunk.length;
                    const msg = e?.name === 'AbortError' ? 'tiempo de espera agotado (60s)' : (e?.message || 'error desconocido');
                    errorDetails.push(`Lote ${chunkNum}: ${msg}`);
                    console.error(`Chunk ${chunkNum} error:`, msg);
                } finally {
                    clearTimeout(tid);
                    completedChunks++;
                    setUploadProgress({ current: completedChunks, total: totalChunks });
                }
            };

            for (let i = 0; i < rpcChunks.length; i += CONCURRENCY) {
                const wave = rpcChunks.slice(i, i + CONCURRENCY);
                await Promise.all(wave.map((chunk, idx) => runChunk(chunk, i + idx + 1)));
            }

            const updatedStatuses = [...rowStatuses];
            let newIdx = 0;
            parsedRows.forEach((_, idx) => {
                if (rowStatuses[idx] === 'new' || rowStatuses[idx] === 'update') {
                    updatedStatuses[idx] = newIdx < inserted ? 'loaded' : 'error';
                    newIdx++;
                }
            });
            setRowStatuses(updatedStatuses);

            const skipped = parsedRows.length - newRows.length - deduplicated;

            // Log al historial (no bloquea)
            supabase.from('tms_historial_cargas').insert([{
                usuario_id: user?.id,
                usuario_nombre: user?.nombre || user?.email || 'Desconocido',
                modulo: currentTab.label,
                tabla_destino: currentTab.table,
                registros_totales: parsedRows.length,
                registros_nuevos: inserted,
                registros_actualizados: rowStatuses.filter(s => s === 'update').length,
                registros_error: errors
            }]).then(({ error }) => {
                if (error) console.error('[DataImport] No se pudo registrar el historial de carga:', error);
            });

            setLoadResult({
                success: errors === 0, total: parsedRows.length, inserted, skipped, errors, deduplicated, errorDetails,
                message: errors === 0
                    ? `${inserted} registros cargados${deduplicated > 0 ? ` · ${deduplicated} duplicados consolidados` : ''}${skipped > 0 ? ` · ${skipped} ignorados` : ''}`
                    : `${inserted} cargados · ${errors} con error${deduplicated > 0 ? ` · ${deduplicated} duplicados` : ''}${skipped > 0 ? ` · ${skipped} ignorados` : ''}`
            });
            setStep('done');
        } catch (err) {
            setLoadResult({ success: false, total: parsedRows.length, inserted: 0, skipped: 0, errors: parsedRows.length, deduplicated: 0, message: `Error: ${err.message}` });
        } finally { setIsLoading(false); setUploadProgress({ current: 0, total: 0 }); }
    };

    const handleReset = () => {
        setRawText(''); setParsedRows([]); setRowStatuses([]); setLoadResult(null);
        setStep('paste'); setSkipFirstColumn(false); setSyncDeleted(false);
        setScannedItems([]); setScanError(''); setManualScanValue(''); setInputMode('paste');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleTabChange = (tabId) => { setActiveTab(tabId); handleReset(); };

    const handleCategoryChange = (catId) => {
        setActiveCategory(catId);
        const firstTab = accessibleTabs.find(t => t.category === catId);
        if (firstTab) handleTabChange(firstTab.id);
    };

    const stats = {
        total: parsedRows.length,
        new: rowStatuses.filter(s => s === 'new').length,
        update: rowStatuses.filter(s => s === 'update').length,
        existing: rowStatuses.filter(s => s === 'existing').length,
        deleted: rowStatuses.filter(s => s === 'deleted').length,
        loaded: rowStatuses.filter(s => s === 'loaded').length,
        error: rowStatuses.filter(s => s === 'error').length,
    };

    const activeCat = CATEGORIES.find(c => c.id === activeCategory);
    const catColor = CATEGORY_COLORS[activeCat?.color || 'slate'];

    // ── RENDER ──
    if (importTabsConfig === null) {
        return (
            <div className="h-full flex items-center justify-center bg-[#F8F9FB]">
                <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
        );
    }

    if (accessibleTabs.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-[#F8F9FB]">
                <div className="text-center bg-white border border-slate-200 rounded-2xl p-10 max-w-sm">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-400 flex items-center justify-center mb-4">
                        <AlertCircle size={28} />
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900 mb-2">Sin acceso</h2>
                    <p className="text-sm text-slate-400">Tu rol no tiene permisos para cargar datos en este módulo. Contacta al administrador.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#F8F9FB] overflow-hidden">
            {showAccessConfig && <AccessConfigPanel onClose={() => setShowAccessConfig(false)} />}

            {/* Header */}
            <header className="shrink-0 bg-white border-b border-slate-200 px-3 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Carga Masiva</h1>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">
                            {currentTab?.label} · Tabla: <span className="font-mono text-slate-500">{currentTab?.table}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isFullAccess && (
                            <button onClick={() => setShowAccessConfig(true)} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors border border-violet-200" title="Configurar acceso por rol">
                                <Shield size={14} /> Accesos
                            </button>
                        )}
                        {step !== 'paste' && (
                            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                                <RefreshCw size={14} /> Nueva carga
                            </button>
                        )}
                    </div>
                </div>

                {/* Category selector */}
                <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar pb-1">
                    {visibleCategories.map(cat => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.id;
                        const colors = CATEGORY_COLORS[cat.color];
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                disabled={isLoading}
                                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap flex-shrink-0 ${isActive ? colors.active : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'} disabled:opacity-50`}
                            >
                                <Icon size={14} />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Sub-tabs within category */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 overflow-x-auto no-scrollbar">
                    {categoryTabs.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                disabled={isLoading}
                                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'} disabled:opacity-50`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4">

                {/* STEP 1: PASTE / SCAN */}
                {step === 'paste' && (
                    <div className="max-w-5xl mx-auto">
                        {/* Instructions card */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
                            <div className="flex items-start gap-3 mb-4">
                                <div className={`w-8 h-8 rounded-lg ${catColor.active} flex items-center justify-center shrink-0`}>
                                    <Info size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 mb-1">{currentTab.label}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">{currentTab.helpText}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {currentTab.columns.map(col => (
                                    <span key={col.key} className={`text-[10px] px-2.5 py-1 rounded-md font-mono ${col.required ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                                        {col.label}{col.required && <span className="text-orange-400 ml-0.5">*</span>}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Mode toggle: Paste vs Scan */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                                <button
                                    onClick={() => setInputMode('paste')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${inputMode === 'paste' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <ClipboardPaste size={14} /> Pegar datos
                                </button>
                                <button
                                    onClick={() => setInputMode('scan')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${inputMode === 'scan' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <QrCode size={14} /> Escanear QR / Código
                                </button>
                            </div>
                        </div>

                        {/* NV options */}
                        {activeTab === 'nv' && inputMode === 'paste' && (
                            <div className="flex items-center gap-3 mb-4">
                                <label className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 cursor-pointer select-none font-bold hover:border-slate-300 transition-colors">
                                    <input type="checkbox" checked={skipFirstColumn} onChange={(e) => { setSkipFirstColumn(e.target.checked); if (rawText) setTimeout(() => parseData(rawText), 50); }}
                                        className="w-3.5 h-3.5 text-blue-500 rounded focus:ring-blue-500 border-slate-300" />
                                    Sin fecha
                                </label>
                                <label className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 cursor-pointer select-none font-bold hover:border-slate-300 transition-colors" title="Cancela ítems que no estén en la selección">
                                    <input type="checkbox" checked={syncDeleted} onChange={(e) => setSyncDeleted(e.target.checked)}
                                        className="w-3.5 h-3.5 text-rose-500 rounded focus:ring-rose-500 border-slate-300" />
                                    Autocancelar faltantes
                                </label>
                            </div>
                        )}

                        {/* ── PASTE MODE ── */}
                        {inputMode === 'paste' && (
                            <>
                                <div
                                    className="relative bg-white border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-2xl min-h-[360px] transition-all cursor-text group flex flex-col overflow-hidden"
                                    onClick={() => textareaRef.current?.focus()}
                                >
                                    {!rawText && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
                                            <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-500 transition-all text-slate-400">
                                                <ClipboardPaste size={26} />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-700 mb-1">Pega tus datos aquí</h3>
                                            <p className="text-xs text-slate-400 mb-5">
                                                <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] border border-slate-200 mx-0.5">Ctrl+V</kbd> desde Excel o Google Sheets
                                            </p>
                                            <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl text-slate-500 font-bold text-xs cursor-pointer transition-all pointer-events-auto">
                                                <Upload size={14} /> Subir CSV
                                                <input ref={fileInputRef} type="file" accept=".csv,.tsv,.txt" onChange={handleFileUpload} className="hidden" />
                                            </label>
                                        </div>
                                    )}
                                    <textarea
                                        ref={textareaRef} value={rawText}
                                        onChange={(e) => setRawText(e.target.value)}
                                        onPaste={handlePaste}
                                        className="w-full flex-1 bg-transparent p-5 resize-none outline-none font-mono text-xs text-slate-700 placeholder:text-transparent min-h-[360px] z-10"
                                        placeholder="Pega datos aquí..."
                                    />
                                </div>

                                {rawText && (
                                    <div className="flex items-center justify-end mt-3">
                                        <button
                                            onClick={() => parseData(rawText)} disabled={isParsing}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                                        >
                                            {isParsing ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                                            Analizar datos
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── SCAN MODE ── */}
                        {inputMode === 'scan' && (
                            <div className="space-y-4">
                                {/* Scan actions */}
                                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                                    <div className="flex flex-col items-center text-center mb-5">
                                        <div className="w-16 h-16 bg-violet-50 border border-violet-200 rounded-2xl flex items-center justify-center mb-3 text-violet-500">
                                            <ScanLine size={30} />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-1">Escanear QR o Código de Barras</h3>
                                        <p className="text-xs text-slate-400">
                                            Escanea con la cámara o ingresa el código manualmente.
                                            Campo destino: <span className="font-bold text-violet-600">{currentTab.columns.find(c => c.key === getScanField())?.label || getScanField()}</span>
                                        </p>
                                    </div>

                                    {/* Camera scan button */}
                                    {isSupportedDevice && (
                                        <button
                                            onClick={handleCameraScan}
                                            disabled={isScanning}
                                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-300 text-white rounded-xl font-bold text-sm transition-colors mb-4"
                                        >
                                            {isScanning ? (
                                                <><Loader2 size={20} className="animate-spin" /> Escaneando...</>
                                            ) : (
                                                <><Camera size={20} /> Abrir Cámara</>
                                            )}
                                        </button>
                                    )}

                                    {/* Manual input */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={manualScanValue}
                                            onChange={(e) => setManualScanValue(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleManualScan(); }}
                                            placeholder="Ingresa código manualmente..."
                                            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                                        />
                                        <button
                                            onClick={handleManualScan}
                                            disabled={!manualScanValue.trim()}
                                            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>

                                    {scanError && (
                                        <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                            <AlertCircle size={14} />
                                            {scanError}
                                        </div>
                                    )}
                                </div>

                                {/* Scanned items list */}
                                {scannedItems.length > 0 && (
                                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
                                            <div className="flex items-center gap-2">
                                                <QrCode size={14} className="text-violet-500" />
                                                <span className="text-xs font-bold text-slate-700">Escaneados</span>
                                                <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{scannedItems.length}</span>
                                            </div>
                                            <button
                                                onClick={() => setScannedItems([])}
                                                className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                Limpiar todo
                                            </button>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
                                            {scannedItems.map((item, idx) => (
                                                <div key={item._scannedAt + idx} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                                                    <span className="text-[10px] font-mono text-slate-400 w-6 text-right shrink-0">{idx + 1}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="text-xs font-bold font-mono text-slate-800 truncate">{item._rawValue}</span>
                                                        </div>
                                                        {item.producto && (
                                                            <p className="text-[10px] text-slate-400 truncate">{item.producto}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => removeScannedItem(idx)}
                                                        className="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all shrink-0"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                                            <button
                                                onClick={processScannedItems}
                                                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors"
                                            >
                                                <ArrowRight size={16} />
                                                Procesar {scannedItems.length} escaneado{scannedItems.length !== 1 ? 's' : ''}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: PREVIEW */}
                {step === 'preview' && parsedRows.length > 0 && (
                    <div className="flex flex-col gap-4">
                        {/* Stats + action bar */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-white p-2 sm:p-3 rounded-xl border border-slate-200">
                            <StatPill icon={Database} label="Total" value={stats.total} color="slate" />
                            <StatPill icon={CheckCircle} label="Nuevas" value={stats.new} color="emerald" />
                            {stats.update > 0 && <StatPill icon={RefreshCw} label="Actualizar" value={stats.update} color="blue" />}
                            {stats.existing > 0 && <StatPill icon={SkipForward} label="Existen" value={stats.existing} color="amber" />}
                            {stats.deleted > 0 && <StatPill icon={Trash2} label="Eliminadas" value={stats.deleted} color="rose" />}
                            {stats.error > 0 && <StatPill icon={XCircle} label="Errores" value={stats.error} color="red" />}

                            <div className="flex-1" />
                            <button
                                onClick={handleUpload}
                                disabled={isLoading || (stats.new === 0 && stats.update === 0)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm transition-colors disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                {isLoading
                                    ? (uploadProgress.total > 0 ? `Lote ${uploadProgress.current}/${uploadProgress.total}...` : 'Preparando...')
                                    : `Confirmar (${stats.new + stats.update})`}
                            </button>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 340px)' }}>
                            <div className="overflow-auto flex-1">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider sticky top-0 z-10">
                                        <tr>
                                            <th className="px-3 py-3 w-10">#</th>
                                            <th className="px-3 py-3 w-20">Estado</th>
                                            {currentTab.columns.map(col => (
                                                <th key={col.key} className="px-3 py-3 whitespace-nowrap">{col.label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {parsedRows.slice(0, 500).map((row, idx) => {
                                            const status = rowStatuses[idx] || 'new';
                                            const bgMap = { new: '', update: 'bg-blue-50/30', existing: 'bg-amber-50/30', deleted: 'bg-rose-50/20', loaded: 'bg-blue-50/30', error: 'bg-red-50/30' };
                                            const iconMap = {
                                                new: <CheckCircle size={13} className="text-emerald-500" />,
                                                update: <RefreshCw size={13} className="text-blue-500" />,
                                                existing: <SkipForward size={13} className="text-amber-500" />,
                                                deleted: <Trash2 size={13} className="text-rose-400" />,
                                                loaded: <Check size={13} className="text-blue-500" />,
                                                error: <XCircle size={13} className="text-red-500" />,
                                            };
                                            const labelMap = { new: 'Nueva', update: 'Actualiza', existing: 'Existe', deleted: 'Eliminada', loaded: 'OK', error: 'Error' };

                                            return (
                                                <tr key={idx} className={`${bgMap[status]} hover:bg-slate-50/50 transition-colors`}>
                                                    <td className="px-3 py-2.5 text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                                                    <td className="px-3 py-2.5">
                                                        <div className="flex items-center gap-1" title={labelMap[status]}>
                                                            {iconMap[status]}
                                                            <span className="text-[10px] font-bold text-slate-500">{labelMap[status]}</span>
                                                        </div>
                                                    </td>
                                                    {currentTab.columns.map(col => (
                                                        <td key={col.key} className="px-3 py-2.5 text-slate-600 whitespace-nowrap max-w-[180px] truncate text-xs" title={String(row[col.key] || '')}>
                                                            {col.type === 'number'
                                                                ? <span className="font-mono font-bold text-slate-800">{row[col.key]}</span>
                                                                : <span>{row[col.key] || <span className="text-slate-300">-</span>}</span>
                                                            }
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                        {parsedRows.length > 500 && (
                                            <tr>
                                                <td colSpan={currentTab.columns.length + 2} className="px-4 py-6 bg-slate-50 text-center text-xs text-slate-400 font-bold">
                                                    Vista previa: 500 de {parsedRows.length.toLocaleString()} filas · Se procesarán todas al confirmar
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: RESULT */}
                {step === 'done' && loadResult && (
                    <div className="max-w-lg mx-auto mt-8">
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5 ${loadResult.success ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                                {loadResult.success ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                            </div>

                            <h2 className="text-lg font-extrabold text-slate-900 mb-2">
                                {loadResult.success ? 'Carga completada' : 'Error en la carga'}
                            </h2>
                            <p className="text-sm text-slate-500 mb-6">{loadResult.message}</p>

                            <div className={`grid ${loadResult.deduplicated > 0 ? 'grid-cols-4' : 'grid-cols-3'} gap-3 mb-6`}>
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                    <p className="text-2xl font-extrabold text-emerald-600">{loadResult.inserted}</p>
                                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Cargados</p>
                                </div>
                                {loadResult.deduplicated > 0 && (
                                    <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                                        <p className="text-2xl font-extrabold text-violet-600">{loadResult.deduplicated}</p>
                                        <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">Duplicados</p>
                                    </div>
                                )}
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                    <p className="text-2xl font-extrabold text-amber-600">{loadResult.skipped}</p>
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Ignorados</p>
                                </div>
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                    <p className="text-2xl font-extrabold text-red-600">{loadResult.errors}</p>
                                    <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Errores</p>
                                </div>
                            </div>

                            {loadResult.errorDetails?.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left mb-6 max-h-36 overflow-y-auto">
                                    <p className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-2">Detalle:</p>
                                    {loadResult.errorDetails.map((e, i) => (
                                        <p key={i} className="text-xs text-red-600 font-mono mb-1">{e}</p>
                                    ))}
                                </div>
                            )}

                            <button onClick={handleReset} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-colors">
                                <RefreshCw size={14} className="inline mr-2" />Nueva carga
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatPill = ({ icon: Icon, label, value, color }) => {
    const colorMap = {
        slate: 'bg-slate-50 border-slate-200 text-slate-600',
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        blue: 'bg-blue-50 border-blue-200 text-blue-700',
        amber: 'bg-amber-50 border-amber-200 text-amber-700',
        rose: 'bg-rose-50 border-rose-200 text-rose-700',
        red: 'bg-red-50 border-red-200 text-red-700',
    };
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${colorMap[color]}`}>
            <Icon size={13} />
            <span>{label}:</span>
            <strong className="text-sm">{value}</strong>
        </div>
    );
};

export default DataImport;
