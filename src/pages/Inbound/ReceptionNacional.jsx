import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ClipboardCheck, Plus, Trash2, Save, Download, Search, Eye, X,
  Package, Truck, Calendar, Hash, Box, Layers, Camera, Loader2,
  ChevronDown, ChevronUp, Filter, FileSpreadsheet, CheckCircle, Clock,
  AlertCircle, ArrowLeft, TrendingUp, BarChart3
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import useBarcodeScanner from '../../hooks/useBarcodeScanner';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { logUpload } from '../../utils/logUpload';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

// ============================================================================
// MÓDULO DE RECEPCIÓN DE PRODUCTOS NACIONALES
// ============================================================================

const TIPO_CONTENEDOR_OPTIONS = ['3-4', '1HCX20', '1HCX40', '2HCX40', 'LCL', 'AEREO'];
const ESTADOS = {
  EN_REVISION: { label: 'En Revisión', color: 'bg-amber-500', textColor: 'text-amber-600', bgLight: 'bg-amber-50' },
  COMPLETADO: { label: 'Completado', color: 'bg-emerald-500', textColor: 'text-emerald-600', bgLight: 'bg-emerald-50' },
  PENDIENTE: { label: 'Pendiente', color: 'bg-slate-400', textColor: 'text-slate-600', bgLight: 'bg-slate-50' },
};

const ReceptionNacional = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { startScan, isScanning, isSupportedDevice } = useBarcodeScanner();
  const containerRef = useRef(null);

  // Vista: 'dashboard' | 'form'
  const [view, setView] = useState('dashboard');
  const [editingId, setEditingId] = useState(null);

  // Filtros del dashboard
  const [filters, setFilters] = useState({ search: '', estado: '', desde: '', hasta: '' });
  const [showFilters, setShowFilters] = useState(false);

  // Modal de detalle
  const [detailModal, setDetailModal] = useState(null);

  // Form state - Header
  const [header, setHeader] = useState({
    fecha_recepcion: new Date().toLocaleDateString('en-CA'),
    proveedor: '',
    oc: '',
    cant_bultos: '',
    pallets_usados: '',
    tipo_contenedor: '3-4',
    notas: ''
  });

  // Form state - Items
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ reff: '', cantidad: 1, serie: '', lote: '', box: '', fecha_vencimiento: '' });

  // ── Auto-guardado del progreso (borrador de recepción NUEVA) ───────────────
  // Cada cambio en la cabecera o los ítems se guarda en el navegador, así una
  // recarga/cierre accidental no pierde lo avanzado. Al editar una recepción ya
  // existente NO se toca el borrador. Se limpia al guardar o al vaciar el form.
  const DRAFT_KEY = 'cco_recepcion_nacional_draft';
  const [draft, setDraft] = useState(null);
  const [autoguardado, setAutoguardado] = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState('');
  // Al EDITAR una recepción existente solo se auto-guarda tras un cambio real
  // (para no crear borradores por solo abrirla). En una recepción nueva, siempre.
  const [formTouched, setFormTouched] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(DRAFT_KEY); if (raw) { const d = JSON.parse(raw); if (d && (d.items?.length || d.header)) setDraft(d); } }
    catch { /* localStorage no disponible */ }
  }, []);

  useEffect(() => {
    if (view !== 'form') return;
    if (editingId !== null && !formTouched) return;   // edición: espera un cambio real
    const h = header || {};
    const hasContent = (items?.length > 0) || h.proveedor || h.oc || h.cant_bultos || h.pallets_usados || (h.notas || '').trim();
    try {
      if (hasContent) { const d = { header, items, editingId, ts: Date.now() }; localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); setDraft(d); setAutoguardado(true); setUltimoGuardado(new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })); }
      else { localStorage.removeItem(DRAFT_KEY); setDraft(null); setAutoguardado(false); setUltimoGuardado(''); }
    } catch { /* ignore */ }
  }, [header, items, view, editingId, formTouched]);

  const limpiarBorrador = () => { try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } setDraft(null); setAutoguardado(false); setUltimoGuardado(''); setFormTouched(false); };
  const continuarBorrador = () => {
    if (!draft) return;
    setHeader((prev) => ({ ...prev, ...draft.header }));
    setItems(Array.isArray(draft.items) ? draft.items : []);
    setEditingId(draft.editingId ?? null);
    setFormTouched(true);
    setView('form');
  };

  // Detección de series duplicadas (una serie no debería repetirse en la recepción).
  const normSerie = (s) => (s || '').trim().toUpperCase();
  const seriesDuplicadas = useMemo(() => {
    const cnt = {};
    for (const it of items) { const s = normSerie(it.serie); if (s) cnt[s] = (cnt[s] || 0) + 1; }
    return new Set(Object.keys(cnt).filter((k) => cnt[k] > 1));
  }, [items]);

  // Animación inicial
  useGSAP(() => {
    gsap.from(containerRef.current, { y: 20, opacity: 0, duration: 0.4, ease: 'power3.out', clearProps: 'all' });
  }, { scope: containerRef });

  // ==================== QUERIES ====================

  // Realtime
  useRealtimeTable('tms_recepciones_nacionales', [['recepciones_nac']]);

  // Fetch recepciones con items count
  const { data: recepciones = [], isLoading } = useQuery({
    queryKey: ['recepciones_nac'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_recepciones_nacionales')
        .select('id, fecha_recepcion, proveedor, oc, cant_bultos, pallets_usados, tipo_contenedor, estado, notas, items_count, usuario_nombre, created_at, calidad_estado, calidad_folio, calidad_disposicion')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Filtered recepciones
  const filteredRecepciones = useMemo(() => {
    return recepciones.filter(r => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const matchesSearch = (r.proveedor || '').toLowerCase().includes(s)
          || (r.oc || '').toLowerCase().includes(s);
        if (!matchesSearch) return false;
      }
      if (filters.estado && r.estado !== filters.estado) return false;
      if (filters.desde && r.fecha_recepcion < filters.desde) return false;
      if (filters.hasta && r.fecha_recepcion > filters.hasta) return false;
      return true;
    });
  }, [recepciones, filters]);

  // ==================== STATS & CHARTS — TODO REACTIVO A FILTROS ====================
  const hasActiveFilters = !!(filters.search || filters.estado || filters.desde || filters.hasta);

  // Stats reactivos: usan filteredRecepciones para que cambien con cada filtro
  const stats = useMemo(() => {
    const src = filteredRecepciones;
    const total = src.length;
    const enRevision = src.filter(r => r.estado === 'EN_REVISION').length;
    const completados = src.filter(r => r.estado === 'COMPLETADO').length;
    const totalBultos = src.reduce((sum, r) => sum + (r.cant_bultos || 0), 0);
    const totalPallets = src.reduce((sum, r) => sum + (r.pallets_usados || 0), 0);
    const promPallets = total > 0 ? (totalPallets / total).toFixed(1) : 0;
    const promBultos = total > 0 ? Math.round(totalBultos / total) : 0;
    // Totales globales (para comparar)
    const globalTotal = recepciones.length;
    const globalPallets = recepciones.reduce((s, r) => s + (r.pallets_usados || 0), 0);
    const globalPromPallets = globalTotal > 0 ? (globalPallets / globalTotal).toFixed(1) : 0;
    return { total, enRevision, completados, totalBultos, totalPallets, promPallets, promBultos, globalTotal, globalPromPallets };
  }, [filteredRecepciones, recepciones]);

  // Charts reactivos: usan filteredRecepciones
  const chartData = useMemo(() => {
    const src = filteredRecepciones;
    const mesesLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Bultos por proveedor (top 10)
    const proveedorMap = {};
    src.forEach(r => {
      const p = r.proveedor || 'N/A';
      if (!proveedorMap[p]) proveedorMap[p] = { proveedor: p, bultos: 0, pallets: 0, recepciones: 0, promPallets: 0 };
      proveedorMap[p].bultos += r.cant_bultos || 0;
      proveedorMap[p].pallets += r.pallets_usados || 0;
      proveedorMap[p].recepciones += 1;
    });
    // Calcular promedio de pallets por proveedor
    Object.values(proveedorMap).forEach(p => {
      p.promPallets = p.recepciones > 0 ? parseFloat((p.pallets / p.recepciones).toFixed(1)) : 0;
    });
    const porProveedor = Object.values(proveedorMap).sort((a, b) => b.bultos - a.bultos).slice(0, 10);

    // Recepciones por mes (timeline)
    const mesMap = {};
    src.forEach(r => {
      if (!r.fecha_recepcion) return;
      const mes = r.fecha_recepcion.slice(0, 7);
      if (!mesMap[mes]) mesMap[mes] = { mes, bultos: 0, pallets: 0, recepciones: 0 };
      mesMap[mes].bultos += r.cant_bultos || 0;
      mesMap[mes].pallets += r.pallets_usados || 0;
      mesMap[mes].recepciones += 1;
    });
    const porMes = Object.values(mesMap).sort((a, b) => a.mes.localeCompare(b.mes));
    porMes.forEach(m => {
      const [y, mo] = m.mes.split('-');
      m.label = `${mesesLabels[parseInt(mo) - 1]} ${y.slice(2)}`;
    });

    // Por tipo contenedor (pie)
    const tipoMap = {};
    src.forEach(r => {
      const t = r.tipo_contenedor || 'N/A';
      tipoMap[t] = (tipoMap[t] || 0) + 1;
    });
    const porTipo = Object.entries(tipoMap).map(([name, value]) => ({ name, value }));

    return { porProveedor, porMes, porTipo };
  }, [filteredRecepciones]);

  // ==================== MUTATIONS ====================

  // Guardar recepción (crear o actualizar)
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!header.proveedor) throw new Error('Proveedor es obligatorio');
      if (items.length === 0) throw new Error('Agrega al menos un ítem');

      let recepcionId = editingId;

      if (editingId) {
        // Actualizar header
        const { error } = await supabase
          .from('tms_recepciones_nacionales')
          .update({
            fecha_recepcion: header.fecha_recepcion,
            proveedor: header.proveedor.toUpperCase(),
            oc: header.oc || null,
            cant_bultos: parseInt(header.cant_bultos) || 0,
            pallets_usados: parseInt(header.pallets_usados) || 0,
            tipo_contenedor: header.tipo_contenedor,
            notas: header.notas || null,
            items_count: items.length,
            estado: header.oc ? 'COMPLETADO' : 'EN_REVISION',
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);
        if (error) throw error;

        // Borrar items anteriores y re-insertar
        await supabase.from('tms_recepcion_items_nacionales').delete().eq('recepcion_id', editingId);
      } else {
        // Crear header
        const { data, error } = await supabase
          .from('tms_recepciones_nacionales')
          .insert({
            fecha_recepcion: header.fecha_recepcion,
            proveedor: header.proveedor.toUpperCase(),
            oc: header.oc || null,
            cant_bultos: parseInt(header.cant_bultos) || 0,
            pallets_usados: parseInt(header.pallets_usados) || 0,
            tipo_contenedor: header.tipo_contenedor,
            notas: header.notas || null,
            productos: items.map(i => i.reff).join(', '),
            cantidades: items.map(i => i.cantidad).join(', '),
            items_count: items.length,
            estado: header.oc ? 'COMPLETADO' : 'EN_REVISION',
            usuario_nombre: user?.nombre || user?.email || 'Usuario'
          })
          .select('id')
          .single();
        if (error) throw error;
        recepcionId = data.id;
      }

      // Insertar items
      const itemsToInsert = items.map(item => ({
        recepcion_id: recepcionId,
        reff: item.reff.toUpperCase(),
        descripcion: item.descripcion || null,
        um: item.um || 'UNI',
        cantidad: parseInt(item.cantidad) || 1,
        serie: item.serie || null,
        lote: item.lote || null,
        box: item.box || null,
        fecha_vencimiento: item.fecha_vencimiento || null,
      }));

      const { error: itemsError } = await supabase
        .from('tms_recepcion_items_nacionales')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    },
    onSuccess: (_, variables) => {
      toast.success(editingId ? 'Recepción actualizada' : 'Recepción guardada correctamente');
      queryClient.invalidateQueries({ queryKey: ['recepciones_nac'] });
      logUpload({
        modulo: 'Recepción Productos Nacionales',
        tablaDestino: 'tms_recepciones_nacionales + tms_recepcion_items_nacionales',
        totalRegistros: items.length + 1,
        nuevos: editingId ? 0 : items.length + 1,
        actualizados: editingId ? items.length + 1 : 0,
        usuarioNombre: user?.nombre || user?.email,
      });
      limpiarBorrador();
      resetForm();
      setView('dashboard');
    },
    onError: (err) => {
      toast.error('Error: ' + err.message);
    }
  });

  // Eliminar recepción completa
  const deleteRecepcion = async (id, proveedor) => {
    if (!window.confirm(`¿Eliminar la recepción de ${proveedor}? Se borrarán también todos sus ítems.`)) return;
    try {
      const { data, error } = await supabase.rpc('eliminar_recepcion_completa', {
        p_id: id,
        p_origen: 'NACIONAL',
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'No se pudo eliminar la recepción');
      toast.success(`Recepción de ${proveedor} eliminada`);
      queryClient.invalidateQueries({ queryKey: ['recepciones_nac'] });
      if (detailModal?.id === id) setDetailModal(null);
    } catch (err) {
      toast.error('Error al eliminar: ' + err.message);
    }
  };

  // ==================== ITEM MANAGEMENT ====================

  const addItem = () => {
    const reff = (currentItem.reff || '').trim().toUpperCase();
    if (!reff) {
      toast.error('El código REFF es obligatorio');
      return;
    }
    if (parseInt(currentItem.cantidad) <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }
    // Series duplicadas: avisar y pedir confirmación (se puede agregar igual).
    const serieNorm = normSerie(currentItem.serie);
    if (serieNorm) {
      const rep = items.findIndex((it) => normSerie(it.serie) === serieNorm);
      if (rep !== -1) {
        if (!window.confirm(`⚠ La serie ${currentItem.serie.trim()} ya está registrada (fila ${rep + 1}).\n\n¿Agregarla de todos modos? Quedará marcada como duplicada.`)) return;
      }
    }

    // Agregar el ítem de INMEDIATO al estado local. No debe depender de una consulta de
    // red: en bodega con señal intermitente el lookup puede colgarse y antes el ítem nunca
    // se agregaba (parecía que el botón no hacía nada).
    const _id = Date.now();
    setItems(prev => [...prev, {
      ...currentItem,
      reff,
      cantidad: parseInt(currentItem.cantidad) || 1,
      descripcion: '',
      um: 'UNI',
      _id
    }]);
    setCurrentItem({ reff: '', cantidad: 1, serie: '', lote: '', box: '', fecha_vencimiento: '' });
    setFormTouched(true);
    toast.success('Ítem agregado y guardado ✓', { duration: 1500 });

    // Enriquecer la descripción en segundo plano (no bloquea el alta).
    lookupDescription(reff)
      .then(desc => {
        if (desc) setItems(prev => prev.map(it => it._id === _id ? { ...it, descripcion: desc } : it));
      })
      .catch(err => console.error('[Reception] Falló lookup de descripción:', err));
  };

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    setFormTouched(true);
  };

  const lookupDescription = async (codigo) => {
    try {
      const { data } = await supabase
        .from('tms_matriz_codigos')
        .select('producto')
        .eq('codigo_producto', codigo.toUpperCase())
        .maybeSingle();
      return data?.producto || '';
    } catch { return ''; }
  };

  // ==================== CAMERA SCAN ====================

  const scanField = (field) => {
    startScan({
      onScan: (value) => {
        const val = value.trim();
        setCurrentItem(prev => ({ ...prev, [field]: val }));
        toast.success(`${field.toUpperCase()} escaneado: ${val}`);
      },
      onError: (msg) => toast.error(msg)
    });
  };

  // ==================== DETAIL VIEW ====================

  const loadDetail = async (recepcion) => {
    try {
      const { data, error } = await supabase
        .from('tms_recepcion_items_nacionales')
        .select('id, reff, descripcion, um, cantidad, serie, lote, box, fecha_vencimiento')
        .eq('recepcion_id', recepcion.id)
        .order('id', { ascending: true });
      if (error) throw error;
      setDetailModal({ ...recepcion, items: data || [] });
    } catch (err) {
      toast.error('Error cargando detalle');
    }
  };

  const editRecepcion = async (recepcion) => {
    try {
      const { data, error } = await supabase
        .from('tms_recepcion_items_nacionales')
        .select('id, reff, descripcion, um, cantidad, serie, lote, box, fecha_vencimiento')
        .eq('recepcion_id', recepcion.id)
        .order('id', { ascending: true });
      if (error) throw error;

      setHeader({
        fecha_recepcion: recepcion.fecha_recepcion || new Date().toLocaleDateString('en-CA'),
        proveedor: recepcion.proveedor || '',
        oc: recepcion.oc || '',
        cant_bultos: recepcion.cant_bultos || '',
        pallets_usados: recepcion.pallets_usados || '',
        tipo_contenedor: recepcion.tipo_contenedor || '3-4',
        notas: recepcion.notas || ''
      });
      setItems((data || []).map(i => ({ ...i, _id: i.id })));
      setEditingId(recepcion.id);
      setFormTouched(false);
      setDetailModal(null);
      setView('form');
    } catch (err) {
      toast.error('Error cargando datos');
    }
  };

  // ==================== EXCEL EXPORT ====================

  const exportToExcel = (recepcion, exportItems) => {
    // Hoja 1: Items detallados (formato morado de la imagen)
    const wsData = exportItems.map(item => ({
      'CODIGO': item.reff,
      'DESCRIPCION': item.descripcion || '',
      'U.M': item.um || 'UNI',
      'CANTIDAD': item.cantidad,
      'SERIE': item.serie || '',
      'PARTIDA': item.lote || '',
      'VENCIMIENTO': item.fecha_vencimiento || ''
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 16 }, // CODIGO
      { wch: 50 }, // DESCRIPCION
      { wch: 6 },  // U.M
      { wch: 10 }, // CANTIDAD
      { wch: 16 }, // SERIE
      { wch: 16 }, // PARTIDA
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Detalle Items');

    // Hoja 2: Resumen header
    const headerData = [{
      'FECHA RECEPCION': recepcion.fecha_recepcion,
      'PROVEEDOR': recepcion.proveedor,
      'OC': recepcion.oc || '',
      'CANT BULTOS': recepcion.cant_bultos,
      'PALLETS USADOS': recepcion.pallets_usados,
      'TIPO CONTENEDOR': recepcion.tipo_contenedor,
      'ESTADO': recepcion.estado,
      'TOTAL ITEMS': exportItems.length,
      'TOTAL CANTIDAD': exportItems.reduce((sum, i) => sum + (i.cantidad || 0), 0)
    }];
    const ws2 = XLSX.utils.json_to_sheet(headerData);
    ws2['!cols'] = [
      { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 14 },
      { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 16 }
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumen');

    const fileName = `RecepcionNacional_${recepcion.proveedor}_${recepcion.fecha_recepcion || 'sin-fecha'}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success(`Archivo descargado: ${fileName}`);
  };

  const exportAllToExcel = () => {
    if (filteredRecepciones.length === 0) {
      toast.error('No hay recepciones para exportar');
      return;
    }

    const wsData = filteredRecepciones.map(r => ({
      'FECHA RECEPCION': r.fecha_recepcion,
      'PROVEEDOR': r.proveedor,
      'OC': r.oc || '',
      'CANT BULTOS': r.cant_bultos || 0,
      'PALLETS USADOS': r.pallets_usados || 0,
      'TIPO CONT': r.tipo_contenedor || '',
      'ESTADO': r.estado,
      'ITEMS': r.items_count || 0,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 18 }, { wch: 22 }, { wch: 14 }, { wch: 14 },
      { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 8 }
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Recepciones');
    XLSX.writeFile(wb, `Recepciones_Nacionales_${new Date().toLocaleDateString('en-CA')}.xlsx`);
    toast.success('Reporte exportado');
  };

  // ==================== HELPERS ====================

  const resetForm = () => {
    setHeader({
      fecha_recepcion: new Date().toLocaleDateString('en-CA'),
      proveedor: '', oc: '', cant_bultos: '', pallets_usados: '',
      tipo_contenedor: '3-4', notas: ''
    });
    setItems([]);
    setCurrentItem({ reff: '', cantidad: 1, serie: '', lote: '', box: '', fecha_vencimiento: '' });
    setEditingId(null);
    setFormTouched(false);
  };

  const formatDate = (d) => {
    if (!d) return '-';
    const parts = d.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // ==================== RENDER ====================

  return (
    <div ref={containerRef} className="space-y-4 min-h-screen bg-gray-50 p-3 sm:p-5 text-slate-700 pb-20">
      {/* HEADER — Corporate Clean */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white px-4 sm:px-6 py-4 sm:py-5 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white flex-shrink-0">
            <ClipboardCheck size={18} />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-800">Recepción Productos Nacionales</h2>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Nacionales — Revisión y registro</p>
          </div>
        </div>
        <div className="flex gap-2">
          {view === 'dashboard' && (
            <>
              <button onClick={exportAllToExcel} className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                <FileSpreadsheet size={14} /> Exportar
              </button>
              <button onClick={() => { resetForm(); setView('form'); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                <Plus size={14} /> Nueva Recepción
              </button>
            </>
          )}
          {view === 'form' && (
            <>
              <span
                key={ultimoGuardado}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border ${autoguardado ? 'bg-emerald-50 border-emerald-200 text-emerald-700 anim-saved' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                title="Tu progreso se guarda solo en este dispositivo; puedes recargar o cerrar sin perderlo."
              >
                <CheckCircle size={14} /> {autoguardado ? `Guardado ${ultimoGuardado}` : 'Se guardará solo'}
              </span>
              <button onClick={() => { resetForm(); setView('dashboard'); }} className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                <ArrowLeft size={14} /> Volver
              </button>
            </>
          )}
        </div>
      </div>

      {/* ==================== DASHBOARD VIEW — CORPORATE CLEAN ==================== */}
      {view === 'dashboard' && (
        <>
          {/* Borrador recuperado: recepción sin terminar guardada automáticamente */}
          {draft && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-800 flex items-center gap-1.5"><Save size={15} /> Tienes una recepción sin terminar</p>
                <p className="text-xs text-amber-700 mt-0.5">{draft.items?.length || 0} ítem(s){draft.header?.proveedor ? ` · ${draft.header.proveedor}` : ''} — se guardó automáticamente. Puedes continuar donde quedaste.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={continuarBorrador} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors">Continuar</button>
                <button onClick={() => { if (window.confirm('¿Descartar el borrador guardado? Se perderá lo no registrado.')) limpiarBorrador(); }} className="px-3 py-2 bg-white border border-amber-300 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors">Descartar</button>
              </div>
            </div>
          )}

          {/* KPI Strip */}
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-6 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
            <KpiCell label="Recepciones" value={stats.total} sub={hasActiveFilters ? `de ${stats.globalTotal}` : null} />
            <KpiCell label="En Revisión" value={stats.enRevision} accent="text-amber-600" />
            <KpiCell label="Completados" value={stats.completados} accent="text-teal-600" />
            <KpiCell label="Total Bultos" value={stats.totalBultos.toLocaleString()} />
            <KpiCell label="Prom. Pallets" value={stats.promPallets} accent="text-slate-800" sub={hasActiveFilters ? `global: ${stats.globalPromPallets}` : null} />
            <KpiCell label="Prom. Bultos" value={stats.promBultos} />
          </div>

          {/* Filtros inline */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Buscar proveedor u OC..."
                value={filters.search}
                onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400 transition-colors"
              />
            </div>
            <select value={filters.estado} onChange={e => setFilters(p => ({ ...p, estado: e.target.value }))} className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400">
              <option value="">Todos los estados</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="COMPLETADO">Completado</option>
              <option value="PENDIENTE">Pendiente</option>
            </select>
            <input type="date" value={filters.desde} onChange={e => setFilters(p => ({ ...p, desde: e.target.value }))} className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400" />
            <span className="text-slate-300 text-xs self-center hidden md:block">—</span>
            <input type="date" value={filters.hasta} onChange={e => setFilters(p => ({ ...p, hasta: e.target.value }))} className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400" />
            {hasActiveFilters && (
              <button onClick={() => setFilters({ search: '', estado: '', desde: '', hasta: '' })} className="px-2 py-2 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors whitespace-nowrap">
                Limpiar
              </button>
            )}
          </div>

          {/* Indicador filtro activo */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
              <Filter size={12} />
              <span>
                Mostrando <b className="text-slate-700">{filteredRecepciones.length}</b> de {recepciones.length}
                {filters.search && <span> · Proveedor: <b className="text-slate-700">{filters.search}</b></span>}
              </span>
            </div>
          )}

          {/* Charts Grid — 2 columnas principales */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
            {/* Timeline Chart */}
            <div className="lg:col-span-8 bg-white p-3 sm:p-5 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700">Volumen mensual</h3>
                {hasActiveFilters && <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Filtrado</span>}
              </div>
              {chartData.porMes.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData.porMes} barGap={4} barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#cbd5e1' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} cursor={{ fill: '#f8fafc' }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                    <Bar dataKey="bultos" fill="#0f766e" name="Bultos" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="pallets" fill="#94a3b8" name="Pallets" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-slate-300 text-sm">Sin datos</div>
              )}
            </div>

            {/* Pie Chart + KPIs laterales */}
            <div className="lg:col-span-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Tipo contenedor</h3>
              {chartData.porTipo.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={chartData.porTipo} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}
                      style={{ fontSize: 10, fontWeight: 600 }}>
                      {chartData.porTipo.map((_, idx) => (
                        <Cell key={idx} fill={['#0f766e', '#475569', '#0284c7', '#d97706', '#dc2626', '#7c3aed'][idx % 6]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[240px] flex items-center justify-center text-slate-300 text-sm">Sin datos</div>
              )}
            </div>
          </div>

          {/* Proveedores — Tabla analítica (estilo Tableau) */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Análisis por proveedor</h3>
              {hasActiveFilters && <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Filtrado</span>}
            </div>
            {chartData.porProveedor.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-slate-500 uppercase tracking-wider">Recepciones</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-slate-500 uppercase tracking-wider">Bultos</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-slate-500 uppercase tracking-wider">Pallets</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-slate-500 uppercase tracking-wider">Prom. Pallets</th>
                      <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wider w-[200px]">Distribución</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.porProveedor.map((p, idx) => {
                      const maxBultos = Math.max(...chartData.porProveedor.map(x => x.bultos));
                      const barWidth = maxBultos > 0 ? (p.bultos / maxBultos) * 100 : 0;
                      return (
                        <tr key={p.proveedor}
                          className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                          onClick={() => setFilters(f => ({ ...f, search: p.proveedor }))}>
                          <td className="px-4 py-2.5 font-semibold text-slate-800">{p.proveedor}</td>
                          <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums">{p.recepciones}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-slate-800 tabular-nums">{p.bultos.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums">{p.pallets}</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="inline-block bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{p.promPallets}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-600 rounded-full transition-all duration-500" style={{ width: `${barWidth}%` }} />
                              </div>
                              <span className="text-[10px] text-slate-400 w-8 text-right tabular-nums">{Math.round(barWidth)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-300 text-sm">Sin datos</div>
            )}
          </div>

          {/* Tabla de Recepciones */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Registro de recepciones</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap min-w-[90px]">Fecha</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">OC</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Bultos</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Pallets</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Tipo</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Calidad</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-500 uppercase tracking-wider w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-300"><Loader2 size={20} className="animate-spin mx-auto mb-2" />Cargando...</td></tr>
                  ) : filteredRecepciones.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-300">Sin resultados</td></tr>
                  ) : (
                    filteredRecepciones.map((r, idx) => {
                      const estado = ESTADOS[r.estado] || ESTADOS.PENDIENTE;
                      return (
                        <tr key={r.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                          <td className="px-4 py-2.5 text-slate-600 tabular-nums whitespace-nowrap">{formatDate(r.fecha_recepcion)}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-800 max-w-[160px] truncate">{r.proveedor}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-500 whitespace-nowrap">{r.oc || <span className="text-slate-300">—</span>}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-slate-700 whitespace-nowrap">{r.cant_bultos || 0}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-slate-700 whitespace-nowrap">{r.pallets_usados || 0}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{r.tipo_contenedor}</span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              r.estado === 'COMPLETADO' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                              r.estado === 'EN_REVISION' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>{estado.label}</span>
                          </td>
                          <td className="px-4 py-2.5 text-center whitespace-nowrap">
                            {r.calidad_estado === 'CONFORME' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200" title={r.calidad_folio || ''}>✓ Conforme</span>
                            ) : r.calidad_estado === 'NO_CONFORME' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200" title={r.calidad_disposicion || r.calidad_folio || ''}>✕ No conforme</span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">Pendiente</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              <button onClick={() => loadDetail(r)} className="p-1 hover:bg-slate-100 rounded transition-colors" title="Ver detalle">
                                <Eye size={14} className="text-slate-400 hover:text-slate-600" />
                              </button>
                              <button onClick={() => editRecepcion(r)} className="p-1 hover:bg-slate-100 rounded transition-colors" title="Editar">
                                <ClipboardCheck size={14} className="text-slate-400 hover:text-amber-600" />
                              </button>
                              <button onClick={() => deleteRecepcion(r.id, r.proveedor)} className="p-1 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                                <Trash2 size={14} className="text-slate-400 hover:text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ==================== FORM VIEW ==================== */}
      {view === 'form' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* HEADER FORM */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200">
              <h3 className="font-black text-slate-900 text-lg mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 text-sm font-black">1</span>
                DATOS DE RECEPCIÓN
              </h3>

              <div className="space-y-4">
                {/* Fecha */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fecha Recepción <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="date" value={header.fecha_recepcion} onChange={e => setHeader(p => ({ ...p, fecha_recepcion: e.target.value }))} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-400" required />
                  </div>
                </div>

                {/* Proveedor */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Proveedor <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" value={header.proveedor} onChange={e => setHeader(p => ({ ...p, proveedor: e.target.value.toUpperCase() }))} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold uppercase outline-none focus:border-emerald-400" placeholder="SAIKANG, BCF..." required />
                  </div>
                </div>

                {/* OC */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">OC <span className="text-amber-500 text-[9px]">(después de revisión)</span></label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" value={header.oc} onChange={e => setHeader(p => ({ ...p, oc: e.target.value }))} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-400" placeholder="21073..." />
                  </div>
                </div>

                {/* Bultos + Pallets */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cant Bultos <span className="text-red-500">*</span></label>
                    <input type="number" value={header.cant_bultos} onChange={e => setHeader(p => ({ ...p, cant_bultos: e.target.value }))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-400" placeholder="0" min="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pallets Usados</label>
                    <input type="number" value={header.pallets_usados} onChange={e => setHeader(p => ({ ...p, pallets_usados: e.target.value }))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-400" placeholder="0" min="0" />
                  </div>
                </div>

                {/* Tipo Contenedor */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo Contenedor</label>
                  <select value={header.tipo_contenedor} onChange={e => setHeader(p => ({ ...p, tipo_contenedor: e.target.value }))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-400">
                    {TIPO_CONTENEDOR_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notas</label>
                  <textarea rows={2} value={header.notas} onChange={e => setHeader(p => ({ ...p, notas: e.target.value }))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400 resize-none" placeholder="Observaciones..." />
                </div>
              </div>
            </div>
          </div>

          {/* ITEMS FORM + LIST */}
          <div className="xl:col-span-2 space-y-6">
            {/* Add Item Form — ESPACIOSO */}
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border-2 border-emerald-200">
              <h3 className="font-black text-slate-900 text-lg sm:text-xl mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-emerald-600 text-sm sm:text-base font-black">2</span>
                AGREGAR ÍTEMS
              </h3>

              {/* ===== FILA 1: REFF (código de producto) ===== */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">Código REFF <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={currentItem.reff}
                  onChange={e => setCurrentItem(p => ({ ...p, reff: e.target.value.toUpperCase() }))}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-mono font-black uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  placeholder="CMS60D1"
                />
              </div>

              {/* ===== FILA 2: CANTIDAD + BOX ===== */}
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">Cantidad</label>
                  <input
                    type="number"
                    value={currentItem.cantidad}
                    onChange={e => setCurrentItem(p => ({ ...p, cantidad: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-black outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">Box / Caja</label>
                  <input
                    type="text"
                    value={currentItem.box}
                    onChange={e => setCurrentItem(p => ({ ...p, box: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="B1..."
                  />
                </div>
              </div>

              {/* ===== SEPARADOR VISUAL ===== */}
              <div className="border-t-2 border-dashed border-emerald-200 my-6"></div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Camera size={14} /> CAMPOS CON ESCÁNER DE CÁMARA
              </p>

              {/* ===== FILA 3: SERIE con botón GRANDE de cámara ===== */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">
                  N° Serie
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={currentItem.serie}
                    onChange={e => setCurrentItem(p => ({ ...p, serie: e.target.value }))}
                    className="flex-1 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="26010500018..."
                  />
                  <button
                    type="button"
                    onClick={() => scanField('serie')}
                    disabled={isScanning}
                    className="px-5 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 min-w-[120px]"
                  >
                    <Camera size={20} />
                    <span className="hidden sm:inline">ESCANEAR</span>
                  </button>
                </div>
              </div>

              {/* ===== FILA 4: LOTE con botón GRANDE de cámara ===== */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">
                  Lote / Partida
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={currentItem.lote}
                    onChange={e => setCurrentItem(p => ({ ...p, lote: e.target.value }))}
                    className="flex-1 p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                    placeholder="LOTE-2026..."
                  />
                  <button
                    type="button"
                    onClick={() => scanField('lote')}
                    disabled={isScanning}
                    className="px-5 py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 min-w-[120px]"
                  >
                    <Camera size={20} />
                    <span className="hidden sm:inline">ESCANEAR</span>
                  </button>
                </div>
              </div>

              {/* ===== FILA 5: FECHA DE VENCIMIENTO ===== */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2 tracking-wider">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  value={currentItem.fecha_vencimiento}
                  onChange={e => setCurrentItem(p => ({ ...p, fecha_vencimiento: e.target.value }))}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>

              {/* ===== BOTÓN AGREGAR ===== */}
              <button
                type="button"
                onClick={addItem}
                className="w-full bg-emerald-50 border-2 border-emerald-400 hover:bg-emerald-100 text-emerald-700 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all active:scale-[0.97] hover:shadow-md"
              >
                <Plus size={22} /> AGREGAR ÍTEM
              </button>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                  ÍTEMS REGISTRADOS
                  <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{items.length}</span>
                  {seriesDuplicadas.size > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 border border-red-300 rounded-full px-2 py-0.5" title="Hay series repetidas — revísalas (marcadas en rojo)">
                      <AlertCircle size={12} /> {seriesDuplicadas.size} serie(s) duplicada(s)
                    </span>
                  )}
                  {autoguardado && (
                    <span key={ultimoGuardado} className="anim-saved inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-full px-2 py-0.5" title="Tu progreso se guarda solo en este dispositivo; puedes recargar sin perderlo">
                      <CheckCircle size={12} /> Guardado {ultimoGuardado}
                    </span>
                  )}
                </h3>
                {items.length > 0 && (
                  <span className="text-xs font-bold text-slate-500">
                    Total: {items.reduce((sum, i) => sum + (parseInt(i.cantidad) || 0), 0)} unidades
                  </span>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
                {items.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Box size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="font-bold">Sin ítems</p>
                    <p className="text-xs">Usa el formulario de arriba para agregar productos</p>
                  </div>
                ) : (
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="bg-emerald-700 text-white text-xs uppercase">
                        <th className="px-2 sm:px-3 py-2 text-left">#</th>
                        <th className="px-2 sm:px-3 py-2 text-left">REFF</th>
                        <th className="px-2 sm:px-3 py-2 text-center">Cant</th>
                        <th className="px-2 sm:px-3 py-2 text-left">Serie</th>
                        <th className="px-2 sm:px-3 py-2 text-left">Lote</th>
                        <th className="px-2 sm:px-3 py-2 text-left">Vence</th>
                        <th className="px-2 sm:px-3 py-2 text-left">Box</th>
                        <th className="px-2 sm:px-3 py-2 text-center">-</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => {
                        const dup = !!normSerie(item.serie) && seriesDuplicadas.has(normSerie(item.serie));
                        return (
                        <tr key={item._id || idx} className={`border-b border-slate-100 ${dup ? 'bg-red-50 hover:bg-red-100/70' : (idx % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30')}`}>
                          <td className="px-3 py-2 text-slate-400 text-xs">{idx + 1}</td>
                          <td className="px-3 py-2 font-mono font-bold text-slate-900">{item.reff}</td>
                          <td className="px-3 py-2 text-center font-bold text-emerald-700">{item.cantidad}</td>
                          <td className="px-3 py-2 font-mono text-xs text-slate-600">
                            <span className={dup ? 'text-red-700 font-bold' : ''}>{item.serie || '-'}</span>
                            {dup && <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-black text-red-700 bg-red-100 border border-red-300 rounded px-1 align-middle" title="Serie repetida en esta recepción"><AlertCircle size={9} /> DUPLICADA</span>}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-slate-600">{item.lote || '-'}</td>
                          <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{item.fecha_vencimiento || '-'}</td>
                          <td className="px-3 py-2 text-xs text-slate-600">{item.box || '-'}</td>
                          <td className="px-3 py-2 text-center">
                            <button onClick={() => removeItem(idx)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Save Button */}
              {items.length > 0 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-colors disabled:opacity-50 shadow-lg active:scale-[0.98]"
                  >
                    {saveMutation.isPending ? (
                      <><Loader2 size={22} className="animate-spin" /> GUARDANDO...</>
                    ) : (
                      <><Save size={22} /> {editingId ? 'ACTUALIZAR' : 'GUARDAR'} RECEPCIÓN ({items.length} ítems)</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== DETAIL MODAL ==================== */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-slate-800 text-white flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-black truncate">Recepción — {detailModal.proveedor}</h3>
                <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-300">
                  <span>📅 {formatDate(detailModal.fecha_recepcion)}</span>
                  {detailModal.oc && <span>📋 OC: {detailModal.oc}</span>}
                  <span>📦 {detailModal.cant_bultos || 0} bultos</span>
                  <span>🏗️ {detailModal.pallets_usados || 0} pallets</span>
                  <span>🚛 {detailModal.tipo_contenedor}</span>
                </div>
              </div>
              <button onClick={() => setDetailModal(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-3">
              <button onClick={() => editRecepcion(detailModal)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
                <ClipboardCheck size={16} /> EDITAR
              </button>
              <button
                onClick={() => exportToExcel(detailModal, detailModal.items)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Download size={16} /> DESCARGAR EXCEL
              </button>
              <button
                onClick={() => deleteRecepcion(detailModal.id, detailModal.proveedor)}
                className="px-4 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-600 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ml-auto"
              >
                <Trash2 size={16} /> ELIMINAR
              </button>
            </div>

            {/* Modal Table */}
            <div className="overflow-auto max-h-[50vh]">
              <table className="w-full text-sm">
                <thead className="sticky top-0">
                  <tr className="bg-purple-800 text-white text-xs uppercase tracking-wider">
                    <th className="px-2 sm:px-4 py-3 text-left font-bold">CÓDIGO</th>
                    <th className="px-2 sm:px-4 py-3 text-left font-bold">DESCRIPCIÓN</th>
                    <th className="px-2 sm:px-4 py-3 text-center font-bold">U.M</th>
                    <th className="px-2 sm:px-4 py-3 text-center font-bold">CANTIDAD</th>
                    <th className="px-2 sm:px-4 py-3 text-left font-bold">SERIE</th>
                    <th className="px-2 sm:px-4 py-3 text-left font-bold">PARTIDA</th>
                    <th className="px-2 sm:px-4 py-3 text-left font-bold">VENCE</th>
                  </tr>
                </thead>
                <tbody>
                  {(detailModal.items || []).map((item, idx) => (
                    <tr key={item.id || idx} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'}`}>
                      <td className="px-2 sm:px-4 py-2.5 font-mono font-bold text-slate-800">{item.reff}</td>
                      <td className="px-2 sm:px-4 py-2.5 text-slate-600 truncate max-w-[300px]">{item.descripcion || '-'}</td>
                      <td className="px-2 sm:px-4 py-2.5 text-center text-slate-500">{item.um || 'UNI'}</td>
                      <td className="px-2 sm:px-4 py-2.5 text-center font-bold text-slate-900">{item.cantidad}</td>
                      <td className="px-2 sm:px-4 py-2.5 font-mono text-xs text-slate-600">{item.serie || ''}</td>
                      <td className="px-2 sm:px-4 py-2.5 font-mono text-xs text-slate-600">{item.lote || ''}</td>
                      <td className="px-2 sm:px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">{item.fecha_vencimiento || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500">Total ítems: {detailModal.items?.length || 0}</span>
              <span className="font-bold text-slate-700">Total cantidad: {(detailModal.items || []).reduce((s, i) => s + (i.cantidad || 0), 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== STAT CARD COMPONENT ====================

// Corporate Clean KPI Cell
const KpiCell = ({ label, value, accent, sub }) => (
  <div className="bg-white px-2 sm:px-4 py-2.5 sm:py-3 text-center">
    <p className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1 truncate">{label}</p>
    <p className={`text-lg sm:text-2xl font-bold tabular-nums ${accent || 'text-slate-800'}`}>{value}</p>
    {sub && <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

export default ReceptionNacional;
