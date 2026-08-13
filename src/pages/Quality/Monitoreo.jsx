import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// UUID con fallback: crypto.randomUUID no existe en orígenes no seguros / WebViews
// viejos y lanzaría TypeError al agregar hallazgos o subir evidencia.
const uid = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
import { toast } from 'sonner';
import {
  ClipboardCheck,
  Plus,
  ArrowLeft,
  Search,
  Loader2,
  Trash2,
  Download,
  Send,
  FileSearch,
  ShieldCheck,
  CheckCircle2,
  Pencil,
  AlertTriangle,
  FileText,
  FileType,
  Save,
  PackageSearch,
  Truck,
  Boxes
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { exportToExcel } from '../../lib/exportExcel';
import { exportInformeDanosWord, exportInformeDanosPDF } from '../../lib/exportInformeDanos';
import {
  exportInformeMonitoreoWord,
  exportInformeMonitoreoPDF
} from '../../lib/exportInformeMonitoreo';
import {
  useInformes,
  useInformeItems,
  useCrearInforme,
  useActualizarEstadoInforme,
  useActualizarInforme,
  useEliminarInforme,
  useDictaminar,
  fetchCandidatos,
  useGuardarInformeDanos,
  useInformeEvidencias,
  marcarPreliminarCalidad,
  fetchLotesSeries,
  notificarInventarioPush,
  notificarDictamenPush,
  DICTAMENES,
  BODEGAS_DESTINO,
  CONDICIONES,
  CLASIFICACIONES_DANO,
  TIPOS_ACCION,
  useCrearAccion,
  useAreasCalidad,
  useBodegasDestino,
  tomarAsignacionCalidad,
  guardarProgresoAsignacionCalidad,
  liberarAsignacionCalidad
} from '../../services/calidadService';
import CalidadBadge from '../../components/ui/CalidadBadge';
import PhotoUploader from '../../components/PhotoUploader';
import ChecklistIngreso from './ChecklistIngreso';
import AsignacionesPanel from './AsignacionesCalidad';
import SalidaCertificacion from './SalidaCertificacion';
import {
  useTareasPendientesCount,
  useAsignacionesPendientesCount,
  useSalidaPendientesCount
} from '../../services/calidadService';
import useRealtimeTable from '../../hooks/useRealtimeTable';

const SEMAFORO_CLS = {
  ROJO: 'bg-rose-500',
  NARANJA: 'bg-amber-500',
  VERDE: 'bg-emerald-500',
  NA: 'bg-slate-300'
};
const ESTADO_INFORME_CLS = {
  BORRADOR: 'bg-slate-100 text-slate-600 border-slate-200',
  ENVIADO_CALIDAD: 'bg-blue-100 text-blue-700 border-blue-200',
  DICTAMINADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CERRADO: 'bg-slate-800 text-white border-slate-800'
};
const TIPO_CLS = {
  MONITOREO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DANOS: 'bg-rose-50 text-rose-700 border-rose-200'
};

// ── Selector de Lote (P) / Serie (S) de un producto ────────────────────────
// Muestra la lista desplegable con filtro rápido; permite ingreso manual si la
// partida/serie no se encuentra (para continuar mientras Inventario ajusta).
const SystemBatchSelector = ({ codigo, value, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const boxRef = React.useRef(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await fetchLotesSeries(codigo, q);
        if (alive) setList(data);
      } catch {
        if (alive) setList([]);
      } finally {
        if (alive) setLoading(false);
      }
    }, 220);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [open, q, codigo]);

  useEffect(() => {
    const h = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const pick = (row) => {
    onSelect(row.valor, row.ubicacion || '');
    setOpen(false);
    setQ('');
  };
  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold text-left outline-none hover:border-emerald-400 flex items-center justify-between gap-2"
      >
        <span className={value ? 'text-slate-800 truncate' : 'text-slate-300'}>
          {value || 'Elegir lote / serie…'}
        </span>
        <Search size={14} className="text-slate-400 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filtrar lote (P) o serie (S)…"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-400"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">
                <Loader2 size={16} className="animate-spin inline mr-1" /> Buscando…
              </div>
            ) : list.length === 0 ? (
              <div className="py-5 text-center text-xs text-slate-400">
                Sin lotes/series {q ? `para "${q}"` : ''}
              </div>
            ) : (
              list.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(r)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-emerald-50/50 border-b border-slate-50 last:border-0"
                >
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded ${r.tipo === 'P' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}
                  >
                    {r.tipo === 'P' ? 'LOTE' : 'SERIE'}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800 truncate flex-1">
                    {r.valor}
                  </span>
                  {r.ubicacion && (
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {r.ubicacion}
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold shrink-0 ${Number(r.disponible) > 0 ? 'text-emerald-600' : 'text-slate-300'}`}
                  >
                    {Number(r.disponible) || 0}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const BATCH_NOT_FOUND_NOTE = 'Lote no encontrado en el sistema al momento de la inspección';
const BATCH_MODES = [
  { id: 'system', label: 'Sistema' },
  { id: 'manual', label: 'Manual' },
  { id: 'none', label: 'Sin lote/partida' },
  { id: 'not_found', label: 'No corresponde a los mostrados' }
];

const BatchModeSelector = ({ item, onChange }) => {
  const source = item.batch_source || (item.partida ? 'system' : 'none');
  const value = item.batch_value ?? item.partida ?? '';

  const changeMode = (nextSource) => {
    const patch = {
      batch_source: nextSource,
      batch_value: ['none', 'not_found'].includes(nextSource) ? null : '',
      partida: ''
    };
    if (
      nextSource === 'not_found' &&
      !String(item.observaciones || '').includes(BATCH_NOT_FOUND_NOTE)
    ) {
      patch.observaciones = [item.observaciones?.trim(), BATCH_NOT_FOUND_NOTE]
        .filter(Boolean)
        .join(' · ');
    }
    onChange(patch);
  };

  const changeValue = (nextValue, ubicacion = '') =>
    onChange({
      batch_value: nextValue || null,
      partida: nextValue || '',
      ...(ubicacion ? { ubicacion } : {})
    });

  return (
    <div className="mt-1 rounded-xl border border-slate-200 p-3 bg-slate-50/50">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {BATCH_MODES.map((mode) => (
          <label
            key={mode.id}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[11px] font-bold cursor-pointer ${source === mode.id ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}
          >
            <input
              type="radio"
              name={`batch-${item._key}`}
              checked={source === mode.id}
              onChange={() => changeMode(mode.id)}
            />
            {mode.label}
          </label>
        ))}
      </div>

      {source === 'system' && (
        <SystemBatchSelector codigo={item.codigo_producto} value={value} onSelect={changeValue} />
      )}
      {source === 'manual' && (
        <input
          value={value}
          onChange={(e) => changeValue(e.target.value.toUpperCase())}
          placeholder="Escribe el lote/partida no registrado"
          className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-sm font-mono font-bold outline-none focus:border-amber-500"
        />
      )}
      {source === 'none' && (
        <p className="text-[11px] text-slate-500">Se guardará sin lote o partida.</p>
      )}
      {source === 'not_found' && (
        <p className="text-[11px] text-amber-700">
          Se guardará sin lote y se añadirá automáticamente la observación estándar.
        </p>
      )}
    </div>
  );
};

// ── Constructor / editor de informe de MONITOREO rutinario ─────────────────
const InformeBuilder = ({ informe, prefillItems, asignacion, asignacionId, onCancel, onSaved }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const editMode = !!informe;
  const crear = useCrearInforme();
  const actualizar = useActualizarInforme();
  const { data: itemsExistentes } = useInformeItems(editMode ? informe.id : null);
  const taskId = asignacion?.id || asignacionId || null;

  const [bodega, setBodega] = useState(informe?.bodega || '');
  const [periodicidad, setPeriodicidad] = useState(informe?.periodicidad || 'SEMANAL');
  const [observaciones, setObservaciones] = useState(informe?.observaciones || '');
  const [query, setQuery] = useState('');
  const [soloVenc, setSoloVenc] = useState(false);
  const [candidatos, setCandidatos] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [items, setItems] = useState([]);
  const [manual, setManual] = useState(null); // alta manual (SKU no registrado)
  const [selectedSkuIds, setSelectedSkuIds] = useState([]);
  const [progressHydrated, setProgressHydrated] = useState(!taskId);
  const [autoSave, setAutoSave] = useState({ status: 'idle', savedAt: null, error: '' });
  const [lockInfo, setLockInfo] = useState(
    taskId
      ? {
          name: asignacion?.locked_by_name || user?.nombre || 'Usuario actual',
          at: asignacion?.locked_at || new Date().toISOString()
        }
      : null
  );

  // Precargar ítems en modo edición — solo una vez, para no pisar el trabajo en
  // curso si el usuario empieza a editar antes de que resuelva la query.
  const preloadedRef = useRef(false);
  useEffect(() => {
    if (editMode && itemsExistentes && !preloadedRef.current) {
      preloadedRef.current = true;
      setItems(
        itemsExistentes.map((it) => ({
          _key: `${it.codigo_producto}|${it.partida || ''}|${it.ubicacion || ''}`,
          codigo_producto: it.codigo_producto,
          partida: it.partida || '',
          ubicacion: it.ubicacion || '',
          producto: it.producto || '',
          unidad_medida: it.unidad_medida || '',
          cantidad: Number(it.cantidad) || 0,
          estado_inventario: it.estado_inventario || 'Disponible',
          tipo: it.tipo || 'NO_PERECIBLE',
          fecha_vencimiento: it.fecha_vencimiento || null,
          semaforo: it.semaforo || 'NA',
          condicion_observada: it.condicion_observada || 'OK',
          cantidad_afectada: Number(it.cantidad_afectada) || 0,
          no_registrado: !!it.no_registrado,
          motivo: it.motivo || 'Rutina',
          observaciones: it.observaciones || '',
          batch_source: it.batch_source || (it.partida ? 'system' : 'none'),
          batch_value: it.batch_value ?? it.partida ?? null,
          revision_estado: it.revision_estado || 'PENDIENTE'
        }))
      );
    }
  }, [editMode, itemsExistentes]);

  // Pre-carga desde una asignación del hito 2 (SKUs que Inventario envió a
  // revisión) — solo en informe nuevo, una vez.
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (!editMode && taskId && !prefilledRef.current) {
      prefilledRef.current = true;
      const saved = asignacion?.progress_data;
      const savedItems = Array.isArray(saved?.items) ? saved.items : null;
      if (savedItems?.length) {
        setBodega(saved?.header?.bodega || '');
        setPeriodicidad(saved?.header?.periodicidad || 'SEMANAL');
        setObservaciones(saved?.header?.observaciones || '');
        setSelectedSkuIds(Array.isArray(saved?.selected_sku_ids) ? saved.selected_sku_ids : []);
        setItems(
          savedItems.map((item, index) => ({
            ...item,
            _key:
              item._key ||
              `${item.codigo_producto}|${item.batch_value || item.partida || ''}|${item.ubicacion || ''}|${index}`,
            revision_estado: item.revision_estado || 'PENDIENTE',
            batch_source: item.batch_source || (item.partida ? 'system' : 'none'),
            batch_value: item.batch_value ?? item.partida ?? null
          }))
        );
        setAutoSave({
          status: 'saved',
          savedAt: asignacion?.progress_updated_at || saved?.saved_at || null,
          error: ''
        });
        setProgressHydrated(true);
        return;
      }

      const sourceItems = Array.isArray(prefillItems) ? prefillItems : asignacion?.skus || [];
      setItems(
        sourceItems.map((c) => ({
          _key: `${c.codigo_producto}|${c.partida || ''}|${c.ubicacion || ''}`,
          codigo_producto: c.codigo_producto,
          partida: c.partida || '',
          ubicacion: c.ubicacion || '',
          producto: c.producto || '',
          unidad_medida: c.unidad_medida || 'UN',
          cantidad: Number(c.cantidad) || 0,
          estado_inventario: 'Disponible',
          tipo: c.tipo || 'NO_PERECIBLE',
          fecha_vencimiento: c.fecha_vencimiento || null,
          semaforo: c.semaforo || 'NA',
          condicion_observada: 'OK',
          cantidad_afectada: 0,
          no_registrado: false,
          motivo: 'Hallazgo',
          observaciones: '',
          batch_source: c.batch_source || (c.partida ? 'system' : 'none'),
          batch_value: c.batch_value ?? c.partida ?? null,
          revision_estado: 'PENDIENTE'
        }))
      );
      setProgressHydrated(true);
    }
  }, [asignacion, editMode, prefillItems, taskId]);

  const buscar = useCallback(async () => {
    setBuscando(true);
    try {
      const data = await fetchCandidatos(query, soloVenc);
      setCandidatos(data);
    } catch (e) {
      toast.error(`Error buscando stock: ${e.message}`);
    } finally {
      setBuscando(false);
    }
  }, [query, soloVenc]);

  const addItem = (c) => {
    const key = `${c.codigo_producto}|${c.partida || ''}|${c.ubicacion || ''}`;
    if (items.some((it) => it._key === key)) {
      toast.info('Ese ítem ya está en el informe');
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        _key: key,
        codigo_producto: c.codigo_producto,
        partida: c.partida || '',
        ubicacion: c.ubicacion || '',
        producto: c.producto || '',
        unidad_medida: c.unidad_medida || '',
        cantidad: Number(c.disponible) || 0,
        estado_inventario: 'Disponible',
        tipo: c.tipo || 'NO_PERECIBLE',
        fecha_vencimiento: c.fecha_vencimiento || null,
        semaforo: c.semaforo || 'NA',
        condicion_observada: 'OK',
        cantidad_afectada: 0,
        no_registrado: false,
        motivo: 'Rutina',
        observaciones: '',
        batch_source: c.partida ? 'system' : 'none',
        batch_value: c.partida || null,
        revision_estado: 'PENDIENTE'
      }
    ]);
  };

  // Alta manual de un ítem hallado en auditoría pero no registrado en sistema.
  const addManual = () => {
    const cod = (manual.codigo || '').trim().toUpperCase();
    const ubic = (manual.ubicacion || '').trim().toUpperCase();
    if (!cod) {
      toast.error('Ingresa el código del producto');
      return;
    }
    if (!ubic) {
      toast.error('La ubicación es obligatoria');
      return;
    }
    const key = `MAN|${cod}|${(manual.partida || '').trim()}|${ubic}`;
    if (items.some((it) => it._key === key)) {
      toast.info('Ese ítem ya está en el informe');
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        _key: key,
        codigo_producto: cod,
        partida: (manual.partida || '').trim().toUpperCase(),
        ubicacion: ubic,
        producto: (manual.producto || '').trim() || 'SIN DESCRIPCIÓN',
        unidad_medida: 'UN',
        cantidad: Number(manual.cantidad) || 0,
        estado_inventario: 'No registrado',
        tipo: 'NO_PERECIBLE',
        fecha_vencimiento: null,
        semaforo: 'NA',
        condicion_observada: 'Sobrante',
        cantidad_afectada: Number(manual.cantidad) || 0,
        no_registrado: true,
        motivo: 'Hallazgo',
        observaciones: '',
        batch_source: manual.partida ? 'manual' : 'none',
        batch_value: manual.partida || null,
        revision_estado: 'RECHAZADO'
      }
    ]);
    setManual(null);
    toast.success('Ítem manual agregado (no registrado)');
  };

  const updateItem = (key, field, value) => {
    setItems((prev) => prev.map((it) => (it._key === key ? { ...it, [field]: value } : it)));
  };
  const updateItemPatch = (key, patch) => {
    setItems((prev) => prev.map((it) => (it._key === key ? { ...it, ...patch } : it)));
  };
  // Al volver la condición a "OK" el input de "Uds afectadas" se desmonta; hay que
  // limpiar el valor o quedaría persistido (condición OK con N afectadas → falsea
  // Excel/resumen/informes Word-PDF).
  const setCondicion = (key, c) =>
    setItems((prev) =>
      prev.map((it) =>
        it._key === key
          ? {
              ...it,
              condicion_observada: c,
              revision_estado: c === 'OK' ? 'APROBADO' : 'RECHAZADO',
              ...(c === 'OK' ? { cantidad_afectada: 0 } : {})
            }
          : it
      )
    );
  const removeItem = (key) => {
    setItems((prev) => prev.filter((it) => it._key !== key));
    setSelectedSkuIds((prev) => prev.filter((id) => id !== key));
  };

  const toggleSku = (key) =>
    setSelectedSkuIds((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    );
  const seleccionarTodos = () =>
    setSelectedSkuIds((prev) =>
      prev.length === items.length ? [] : items.map((item) => item._key)
    );
  const aplicarRevisionMasiva = (estadoRevision) => {
    if (selectedSkuIds.length === 0) {
      toast.info('Selecciona uno o más SKUs');
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (!selectedSkuIds.includes(item._key)) return item;
        if (estadoRevision === 'APROBADO') {
          return {
            ...item,
            revision_estado: 'APROBADO',
            condicion_observada: 'OK',
            cantidad_afectada: 0
          };
        }
        return {
          ...item,
          revision_estado: 'RECHAZADO',
          condicion_observada:
            item.condicion_observada === 'OK' ? 'Daño de producto' : item.condicion_observada
        };
      })
    );
  };

  const progressPayload = useMemo(
    () => ({
      version: 1,
      saved_at: new Date().toISOString(),
      header: { bodega, periodicidad, observaciones },
      items,
      selected_sku_ids: selectedSkuIds
    }),
    [bodega, items, observaciones, periodicidad, selectedSkuIds]
  );

  useEffect(() => {
    if (!taskId || !progressHydrated || autoSave.status === 'conflict') return undefined;
    setAutoSave((prev) => ({ ...prev, status: 'pending', error: '' }));
    const timer = window.setTimeout(async () => {
      setAutoSave((prev) => ({ ...prev, status: 'saving', error: '' }));
      try {
        const result = await guardarProgresoAsignacionCalidad(taskId, progressPayload);
        setAutoSave({
          status: 'saved',
          savedAt: result?.saved_at || new Date().toISOString(),
          error: ''
        });
        setLockInfo({
          name: result?.locked_by_name || lockInfo?.name || user?.nombre || 'Usuario actual',
          at: result?.locked_at || new Date().toISOString()
        });
      } catch (error) {
        const conflict = error?.code === 'QUALITY_TASK_LOCKED' || error?.status === 409;
        setAutoSave({
          status: conflict ? 'conflict' : 'error',
          savedAt: null,
          error: error?.message || 'No se pudo guardar el progreso'
        });
      }
    }, 1500);
    return () => window.clearTimeout(timer);
    // lockInfo cambia como respuesta del mismo guardado y no debe iniciar otro autosave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressHydrated, progressPayload, taskId, user?.nombre]);

  const handleCancel = async () => {
    if (taskId && autoSave.status !== 'conflict') {
      try {
        await liberarAsignacionCalidad(taskId);
      } catch (error) {
        console.warn('No se pudo liberar el bloqueo de Calidad', error);
      }
    }
    onCancel();
  };

  const guardar = async (estado) => {
    if (items.length === 0) {
      toast.error('Agrega al menos un ítem');
      return;
    }
    // Ubicación OBLIGATORIA al enviar a Calidad: sin ella el estado no aterriza.
    if (estado === 'ENVIADO_CALIDAD') {
      const sinUbic = items.filter((it) => !(it.ubicacion || '').trim());
      if (sinUbic.length > 0) {
        toast.error(
          `${sinUbic.length} ítem(s) sin ubicación. Es obligatoria para enviar a Calidad.`
        );
        return;
      }
      const sinLoteValido = items.filter(
        (it) =>
          ['system', 'manual'].includes(it.batch_source) &&
          !(it.batch_value || it.partida || '').trim()
      );
      if (sinLoteValido.length > 0) {
        toast.error(`${sinLoteValido.length} ítem(s) requieren elegir o escribir el lote.`);
        return;
      }
      const pendientes = items.filter((it) => it.revision_estado === 'PENDIENTE');
      if (taskId && pendientes.length > 0) {
        toast.error(`Aún faltan ${pendientes.length} SKU(s) por aprobar o rechazar.`);
        return;
      }
    }
    const cleanItems = items.map(({ _key, ...rest }) => rest);
    try {
      if (taskId) {
        const renewed = await tomarAsignacionCalidad(taskId);
        setLockInfo({
          name: renewed?.locked_by_name || user?.nombre || 'Usuario actual',
          at: renewed?.locked_at || new Date().toISOString()
        });
      }
      let informeId = editMode ? informe.id : null;
      if (editMode) {
        const cabecera = {
          bodega: bodega || null,
          periodicidad,
          estado,
          observaciones: observaciones || null
        };
        await actualizar.mutateAsync({ informeId: informe.id, cabecera, items: cleanItems });
        toast.success('Informe actualizado');
      } else {
        const cabecera = {
          fecha: new Date().toISOString().slice(0, 10),
          analista_id: user?.id || null,
          analista_nombre: user?.nombre || null,
          bodega: bodega || null,
          periodicidad,
          estado,
          observaciones: observaciones || null
        };
        const nuevo = await crear.mutateAsync({
          cabecera,
          items: cleanItems,
          asignacionId: estado === 'ENVIADO_CALIDAD' ? taskId : null
        });
        informeId = nuevo?.id || null;
        toast.success(
          estado === 'ENVIADO_CALIDAD' ? 'Informe enviado a Calidad' : 'Borrador guardado'
        );

        if (taskId && nuevo?.asignacion_estado === 'RESUELTA') {
          toast.success('Asignación de estancia resuelta');
        }
      }

      // Reflejo preliminar en Ubicaciones (En Auditoría) al enviar a Calidad.
      if (estado === 'ENVIADO_CALIDAD' && informeId) {
        try {
          const res = await marcarPreliminarCalidad(informeId);
          if (res?.flags > 0) {
            qc.invalidateQueries({ queryKey: ['calidad_flags'] });
            toast.info(`${res.flags} ubicación(es) marcadas "En Auditoría"`);
          }
          if (res?.alertas > 0) {
            toast.warning(`${res.alertas} alerta(s) a Inventario por SKU no registrado`);
            notificarInventarioPush(res.alertas, informeId); // push a móvil (ADMIN)
          }
        } catch (e) {
          console.error('preliminar', e);
        }
      }
      onSaved();
    } catch (e) {
      toast.error(`Error al guardar: ${e.message}`);
    }
  };

  const itemsSinUbic = items.filter((it) => !(it.ubicacion || '').trim()).length;
  const itemsRevisados = items.filter((it) => it.revision_estado !== 'PENDIENTE').length;
  const progreso = items.length > 0 ? Math.round((itemsRevisados / items.length) * 100) : 0;
  const condCls = (c, active) =>
    !active
      ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
      : c === 'OK'
        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
        : 'bg-amber-100 text-amber-800 border-amber-300';

  const saving = crear.isPending || actualizar.isPending;

  if (autoSave.status === 'conflict') {
    return (
      <div className="space-y-4">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700"
        >
          <ArrowLeft size={17} /> Volver a las tareas
        </button>
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-rose-900">
          <h2 className="text-lg font-black">Edición bloqueada</h2>
          <p className="mt-2 text-sm font-bold">{autoSave.error}</p>
          <p className="mt-2 text-xs">
            No se enviarán más cambios desde esta pantalla. El bloqueo protege el avance guardado
            por la otra persona.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button
          onClick={handleCancel}
          className="p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-2xl font-black text-slate-900">
          {editMode ? `Editar Informe ${informe.numero}` : 'Nuevo Informe de Monitoreo'}
        </h2>
      </div>

      {taskId && lockInfo && (
        <div className="sticky top-2 z-20 rounded-2xl border border-emerald-200 bg-emerald-50/95 px-4 py-3 shadow-sm backdrop-blur flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-black text-emerald-800">
            🔒 Tarea en proceso por: {lockInfo.name} - Desde:{' '}
            {new Date(lockInfo.at).toLocaleTimeString('es-CL', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <span className="text-xs font-bold text-emerald-700">Lease renovable · 15 minutos</span>
        </div>
      )}

      {taskId && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-black text-slate-700">Progreso de revisión</span>
            <span className="font-black text-emerald-700">
              {itemsRevisados}/{items.length} SKUs · {progreso}%
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      )}

      {editMode && informe.estado === 'DICTAMINADO' && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-sm">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>
            Este informe ya fue dictaminado. Al guardar, los ítems se reemplazan y se{' '}
            <b>reinician los dictámenes</b> (el overlay de calidad ya registrado se conserva).
          </span>
        </div>
      )}

      {/* Cabecera */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Bodega
          </label>
          <input
            value={bodega}
            onChange={(e) => setBodega(e.target.value)}
            placeholder="Ej. BD 21"
            className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Periodicidad
          </label>
          <select
            value={periodicidad}
            onChange={(e) => setPeriodicidad(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400"
          >
            <option value="SEMANAL">Semanal</option>
            <option value="MENSUAL">Mensual</option>
            <option value="ADHOC">Ad-hoc</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Observaciones
          </label>
          <input
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Notas generales del informe"
            className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Buscador de candidatos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscar()}
              placeholder="Buscar SKU o descripción en stock..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-emerald-400"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 px-2">
            <input
              type="checkbox"
              checked={soloVenc}
              onChange={(e) => setSoloVenc(e.target.checked)}
            />
            Solo 🔴/🟠 (próx. a vencer)
          </label>
          <button
            onClick={buscar}
            disabled={buscando}
            className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700 disabled:opacity-50"
          >
            {buscando ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}{' '}
            Buscar
          </button>
        </div>

        {candidatos.length > 0 && (
          <div className="mt-4 max-h-64 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
            {candidatos.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-emerald-50/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${SEMAFORO_CLS[c.semaforo] || 'bg-slate-300'}`}
                  />
                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 shrink-0">
                    {c.codigo_producto}
                  </span>
                  <span className="text-slate-600 truncate">{c.producto}</span>
                  {c.partida && (
                    <span className="text-[10px] text-slate-400">lote {c.partida}</span>
                  )}
                  {c.ubicacion && (
                    <span className="text-[10px] text-slate-400">· {c.ubicacion}</span>
                  )}
                </div>
                <button
                  onClick={() => addItem(c)}
                  className="ml-3 p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shrink-0"
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ítems capturados en la auditoría */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <h3 className="text-sm font-black text-slate-700">Ítems del informe ({items.length})</h3>
          <div className="flex items-center gap-2">
            {itemsSinUbic > 0 && (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                <AlertTriangle size={12} /> {itemsSinUbic} sin ubicación
              </span>
            )}
            <button
              type="button"
              onClick={() =>
                setManual(
                  manual
                    ? null
                    : { codigo: '', producto: '', ubicacion: '', partida: '', cantidad: 1 }
                )
              }
              className="text-xs font-bold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Plus size={13} /> Agregar manual
            </button>
          </div>
        </div>

        {items.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <label className="mr-auto flex cursor-pointer items-center gap-2 text-xs font-black text-slate-700">
              <input
                type="checkbox"
                checked={selectedSkuIds.length === items.length}
                onChange={seleccionarTodos}
                className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
              />
              Seleccionar todos ({selectedSkuIds.length}/{items.length})
            </label>
            <button
              type="button"
              onClick={() => aplicarRevisionMasiva('APROBADO')}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700"
            >
              Aprobar seleccionados
            </button>
            <button
              type="button"
              onClick={() => aplicarRevisionMasiva('RECHAZADO')}
              className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-black text-white hover:bg-rose-700"
            >
              Rechazar seleccionados
            </button>
          </div>
        )}

        {/* Alta manual: SKU/ubicación no registrado en sistema */}
        {manual && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4">
            <div className="flex items-center gap-2 mb-3 text-amber-800">
              <AlertTriangle size={15} />
              <span className="text-sm font-black">Agregar producto NO registrado en sistema</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Código *
                </label>
                <input
                  value={manual.codigo}
                  onChange={(e) =>
                    setManual((m) => ({ ...m, codigo: e.target.value.toUpperCase() }))
                  }
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold outline-none focus:border-amber-400"
                  placeholder="SKU"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Ubicación *
                </label>
                <input
                  value={manual.ubicacion}
                  onChange={(e) =>
                    setManual((m) => ({ ...m, ubicacion: e.target.value.toUpperCase() }))
                  }
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-bold outline-none focus:border-amber-400"
                  placeholder="A-12-03"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Lote / Serie
                </label>
                <input
                  value={manual.partida}
                  onChange={(e) =>
                    setManual((m) => ({ ...m, partida: e.target.value.toUpperCase() }))
                  }
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono outline-none focus:border-amber-400"
                  placeholder="opcional"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="0"
                  value={manual.cantidad}
                  onChange={(e) =>
                    setManual((m) => ({ ...m, cantidad: Number(e.target.value) || 0 }))
                  }
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-amber-400"
                />
              </div>
              <div className="col-span-2 sm:col-span-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Descripción (opcional)
                </label>
                <input
                  value={manual.producto}
                  onChange={(e) => setManual((m) => ({ ...m, producto: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-amber-400"
                  placeholder="Nombre del producto"
                />
              </div>
            </div>
            <p className="text-[11px] text-amber-700 mt-2 flex items-center gap-1.5">
              <AlertTriangle size={12} /> Al enviar a Calidad se generará una alerta a Inventario
              para dar de alta este ítem.
            </p>
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setManual(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-white"
              >
                Cancelar
              </button>
              <button
                onClick={addManual}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white font-black text-sm hover:bg-amber-700 flex items-center gap-1.5"
              >
                <Plus size={15} /> Agregar
              </button>
            </div>
          </div>
        )}
        {items.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">
            Busca y agrega productos al informe.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((it) => {
              const problema = it.condicion_observada !== 'OK';
              const sinUbic = !(it.ubicacion || '').trim();
              return (
                <div
                  key={it._key}
                  className={`rounded-xl border p-4 ${problema ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}
                >
                  {/* Cabecera del ítem */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <label className="mt-0.5 flex cursor-pointer items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedSkuIds.includes(it._key)}
                        onChange={() => toggleSku(it._key)}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-emerald-600"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`w-2 h-2 rounded-full ${SEMAFORO_CLS[it.semaforo] || 'bg-slate-300'}`}
                          />
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-100">
                            {it.codigo_producto}
                          </span>
                          {it.no_registrado && (
                            <span className="text-[9px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded uppercase tracking-wide">
                              No registrado
                            </span>
                          )}
                          <span className="text-sm text-slate-600 truncate">{it.producto}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {it.unidad_medida || 'UN'}
                          {it.fecha_vencimiento ? ` · vence ${it.fecha_vencimiento}` : ''}
                        </span>
                      </div>
                    </label>
                    <button
                      onClick={() => removeItem(it._key)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Lote/Serie + Ubicación (obligatoria) + cantidad + uds afectadas */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div className="col-span-2">
                      <BatchModeSelector
                        item={it}
                        onChange={(patch) => updateItemPatch(it._key, patch)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        Ubicación {sinUbic && <span className="text-rose-500">*obligatoria</span>}
                      </label>
                      <input
                        value={it.ubicacion}
                        onChange={(e) =>
                          updateItem(it._key, 'ubicacion', e.target.value.toUpperCase())
                        }
                        placeholder="Ej. A-12-03"
                        className={`w-full mt-1 px-3 py-2 rounded-xl border text-sm font-mono font-bold outline-none focus:border-emerald-400 ${sinUbic ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Cant. total
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={it.cantidad}
                        onChange={(e) =>
                          updateItem(it._key, 'cantidad', Number(e.target.value) || 0)
                        }
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400"
                      />
                    </div>
                    {problema && (
                      <div>
                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                          Uds afectadas
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={it.cantidad}
                          value={String(Math.max(0, Math.trunc(Number(it.cantidad_afectada) || 0)))}
                          onChange={(e) =>
                            updateItem(
                              it._key,
                              'cantidad_afectada',
                              Math.max(0, Math.trunc(Number(e.target.value) || 0))
                            )
                          }
                          onBlur={(e) =>
                            updateItem(
                              it._key,
                              'cantidad_afectada',
                              Math.max(0, Math.trunc(Number(e.target.value) || 0))
                            )
                          }
                          className="w-full mt-1 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/50 text-sm font-bold text-amber-800 outline-none focus:border-amber-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Condición en chips */}
                  <div className="mb-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Condición observada
                    </label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {CONDICIONES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCondicion(it._key, c)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${condCls(c, it.condicion_observada === c)}`}
                        >
                          {c !== 'OK' && it.condicion_observada === c && (
                            <AlertTriangle size={11} className="inline mr-1 -mt-0.5" />
                          )}
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nota + estado que aterrizará */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={it.observaciones}
                      onChange={(e) => updateItem(it._key, 'observaciones', e.target.value)}
                      placeholder="Nota / observación"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
                    />
                  </div>
                  {problema && !sinUbic && (
                    <p className="mt-2 text-[11px] text-amber-700 bg-amber-100/60 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                      <AlertTriangle size={12} /> Al enviar,{' '}
                      <b className="font-mono">{it.ubicacion}</b> se marcará "En Auditoría" en
                      Ubicaciones.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-5">
          {!taskId && (
            <button
              onClick={() => guardar(editMode ? informe.estado : 'BORRADOR')}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              {editMode ? 'Guardar cambios' : 'Guardar borrador'}
            </button>
          )}
          {!editMode && (
            <button
              onClick={() => guardar('ENVIADO_CALIDAD')}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Enviar
              a Calidad
            </button>
          )}
        </div>
        {taskId && (
          <div
            className={`mt-4 text-right text-xs font-bold ${autoSave.status === 'error' ? 'text-rose-600' : 'text-slate-500'}`}
          >
            {autoSave.status === 'saving' || autoSave.status === 'pending'
              ? '⏳ Guardando...'
              : autoSave.status === 'error'
                ? `🔴 No se pudo autoguardar: ${autoSave.error}`
                : autoSave.savedAt
                  ? `🟢 Todos los cambios guardados - ${new Date(autoSave.savedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Autoguardado listo'}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Constructor / editor de INFORME DE DAÑOS / NO CONFORMIDAD ───────────────
const REPORTE_VACIO = {
  clasificacion: CLASIFICACIONES_DANO[0],
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
};

const InformeDanosBuilder = ({ informe, prefill, onCancel, onSaved }) => {
  const { user } = useAuth();
  const guardar = useGuardarInformeDanos();
  const { data: itemsExistentes } = useInformeItems(informe?.id || null);

  // Pre-carga desde un checklist NO CONFORME (nuevo informe): antecedentes con la
  // recepción y fecha de recepción; el analista completa el resto.
  const prefillRep =
    !informe && prefill
      ? {
          antecedentes:
            `Recepción ${prefill.oc || 's/OC'} de ${prefill.proveedor || 's/proveedor'} ` +
            `(${prefill.origen === 'NACIONAL' ? 'Nacional' : 'Importación'}) resultó NO CONFORME en el ` +
            `CheckList de ingreso. Se levanta el presente Informe de Daños / Solicitud de No Conformidad al proveedor.`,
          fecha_recepcion: prefill.fecha_recepcion || REPORTE_VACIO.fecha_recepcion
        }
      : {};

  const [informeId, setInformeId] = useState(informe?.id || null);
  const [numero, setNumero] = useState(informe?.numero || '');
  const [bodega, setBodega] = useState(informe?.bodega || '');
  const [estado, setEstado] = useState(informe?.estado || 'BORRADOR');
  const [rep, setRep] = useState({
    ...REPORTE_VACIO,
    ...(informe?.reporte || {}),
    ...prefillRep,
    elaborado_por: informe?.reporte?.elaborado_por || user?.nombre || ''
  });
  const [hallazgos, setHallazgos] = useState([]);

  const { data: evidencias = [], refetch: refetchEvidencias } = useInformeEvidencias(informeId);

  // Precargar hallazgos en edición — solo una vez (ver nota en el builder de
  // monitoreo): no pisar el trabajo en curso cuando resuelve la query.
  const preloadedDanosRef = useRef(false);
  useEffect(() => {
    if (informe?.id && itemsExistentes && !preloadedDanosRef.current) {
      preloadedDanosRef.current = true;
      setHallazgos(
        itemsExistentes.map((it) => ({
          id: it.id,
          _key: it.id,
          codigo_producto: it.codigo_producto || '',
          producto: it.producto || '',
          partida: it.partida || '',
          ubicacion: it.ubicacion || '',
          unidad_medida: it.unidad_medida || '',
          cantidad: Number(it.cantidad) || 0,
          tipo_dano: it.tipo_dano || '',
          componente_afectado: it.componente_afectado || '',
          consecuencia: it.consecuencia || '',
          observaciones: it.observaciones || ''
        }))
      );
    }
  }, [informe?.id, itemsExistentes]);

  const setRepField = (f, v) => setRep((prev) => ({ ...prev, [f]: v }));

  const addHallazgo = () =>
    setHallazgos((prev) => [
      ...prev,
      {
        _key: `tmp-${uid()}`,
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
    ]);
  const updHallazgo = (key, f, v) =>
    setHallazgos((prev) => prev.map((h) => (h._key === key ? { ...h, [f]: v } : h)));
  const delHallazgo = (key) => setHallazgos((prev) => prev.filter((h) => h._key !== key));

  // Cuadro resumen
  const addResumen = () =>
    setRep((prev) => ({
      ...prev,
      cuadro_resumen: [...(prev.cuadro_resumen || []), { indicador: '', valor: '' }]
    }));
  const updResumen = (i, f, v) =>
    setRep((prev) => ({
      ...prev,
      cuadro_resumen: prev.cuadro_resumen.map((r, idx) => (idx === i ? { ...r, [f]: v } : r))
    }));
  const delResumen = (i) =>
    setRep((prev) => ({
      ...prev,
      cuadro_resumen: prev.cuadro_resumen.filter((_, idx) => idx !== i)
    }));

  // Acciones recomendadas
  const addAccion = () =>
    setRep((prev) => ({
      ...prev,
      acciones_recomendadas: [...(prev.acciones_recomendadas || []), '']
    }));
  const updAccion = (i, v) =>
    setRep((prev) => ({
      ...prev,
      acciones_recomendadas: prev.acciones_recomendadas.map((a, idx) => (idx === i ? v : a))
    }));
  const delAccion = (i) =>
    setRep((prev) => ({
      ...prev,
      acciones_recomendadas: prev.acciones_recomendadas.filter((_, idx) => idx !== i)
    }));

  const doGuardar = async (nuevoEstado) => {
    const est = nuevoEstado || estado;
    try {
      const cabecera = informeId
        ? {
            bodega: bodega || null,
            periodicidad: 'ADHOC',
            estado: est,
            observaciones: rep.descripcion_hallazgo || null
          }
        : {
            fecha: new Date().toISOString().slice(0, 10),
            analista_id: user?.id || null,
            analista_nombre: user?.nombre || null,
            bodega: bodega || null,
            periodicidad: 'ADHOC',
            estado: est,
            observaciones: rep.descripcion_hallazgo || null
          };
      const limpios = hallazgos.map(({ _key, ...rest }) => rest);
      const res = await guardar.mutateAsync({
        informeId,
        cabecera,
        reporte: rep,
        hallazgos: limpios
      });
      setInformeId(res.id);
      if (res.numero) setNumero(res.numero);
      setEstado(est);
      // Reasignar ids a los hallazgos para habilitar fotos en los nuevos.
      setHallazgos(res.hallazgos.map((h) => ({ ...h, _key: h.id })));
      refetchEvidencias();
      toast.success('Informe de daños guardado');
    } catch (e) {
      toast.error(`Error al guardar: ${e.message}`);
    }
  };

  const informeObj = {
    id: informeId,
    numero,
    fecha: informe?.fecha || rep.fecha_recepcion,
    bodega,
    analista_nombre: rep.elaborado_por || user?.nombre,
    reporte: rep
  };

  const exportar = async (fmt) => {
    if (!informeId) {
      toast.error('Guarda el informe antes de exportar');
      return;
    }
    try {
      if (fmt === 'word') await exportInformeDanosWord(informeObj, hallazgos, evidencias);
      else await exportInformeDanosPDF(informeObj, hallazgos, evidencias);
    } catch (e) {
      toast.error(`Error al exportar: ${e.message}`);
    }
  };

  const field =
    'w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-rose-400';
  const lbl = 'text-[10px] font-black text-slate-400 uppercase tracking-widest';
  const evForItem = (id) => evidencias.filter((e) => e.item_id === id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-2xl font-black text-slate-900">
            {informeId ? `Informe de Daños ${numero}` : 'Nuevo Informe de Daños'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportar('word')}
            disabled={!informeId}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-blue-700 disabled:opacity-40"
          >
            <FileText size={16} /> Word
          </button>
          <button
            onClick={() => exportar('pdf')}
            disabled={!informeId}
            className="px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-rose-700 disabled:opacity-40"
          >
            <FileType size={16} /> PDF
          </button>
        </div>
      </div>

      {/* Encabezado */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Fecha de recepción</label>
          <input
            type="date"
            value={rep.fecha_recepcion || ''}
            onChange={(e) => setRepField('fecha_recepcion', e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label className={lbl}>Tipo de producto</label>
          <input
            value={rep.tipo_producto}
            onChange={(e) => setRepField('tipo_producto', e.target.value)}
            placeholder="Ej. Biombos (divisores modulares)"
            className={field}
          />
        </div>
        <div>
          <label className={lbl}>Área responsable</label>
          <input
            value={rep.area_responsable}
            onChange={(e) => setRepField('area_responsable', e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label className={lbl}>Clasificación</label>
          <select
            value={rep.clasificacion}
            onChange={(e) => setRepField('clasificacion', e.target.value)}
            className={field}
          >
            {CLASIFICACIONES_DANO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>Bodega</label>
          <input
            value={bodega}
            onChange={(e) => setBodega(e.target.value)}
            placeholder="Ej. BD 21"
            className={field}
          />
        </div>
      </div>

      {/* Antecedentes + descripción */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className={lbl}>1. Antecedentes</label>
          <textarea
            rows={3}
            value={rep.antecedentes}
            onChange={(e) => setRepField('antecedentes', e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label className={lbl}>2. Descripción del hallazgo</label>
          <textarea
            rows={3}
            value={rep.descripcion_hallazgo}
            onChange={(e) => setRepField('descripcion_hallazgo', e.target.value)}
            className={field}
          />
        </div>
      </div>

      {/* Daños identificados (hallazgos + fotos) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-700">
            3. Daños identificados ({hallazgos.length})
          </h3>
          <button
            onClick={addHallazgo}
            className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-slate-700"
          >
            <Plus size={14} /> Agregar hallazgo
          </button>
        </div>
        {hallazgos.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">
            Agrega los hallazgos de daño con sus fotos de evidencia.
          </p>
        ) : (
          <div className="space-y-4">
            {hallazgos.map((h, idx) => (
              <div key={h._key} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-rose-600">Hallazgo 3.{idx + 1}</span>
                  <button
                    onClick={() => delHallazgo(h._key)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={lbl}>Tipo de daño</label>
                    <input
                      value={h.tipo_dano}
                      onChange={(e) => updHallazgo(h._key, 'tipo_dano', e.target.value)}
                      placeholder="Deformación por aplastamiento"
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Componente afectado</label>
                    <input
                      value={h.componente_afectado}
                      onChange={(e) => updHallazgo(h._key, 'componente_afectado', e.target.value)}
                      placeholder="Pilar / Panel"
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Cantidad afectada</label>
                    <input
                      type="number"
                      value={String(Math.max(0, Math.trunc(Number(h.cantidad) || 0)))}
                      onChange={(e) =>
                        updHallazgo(
                          h._key,
                          'cantidad',
                          Math.max(0, Math.trunc(Number(e.target.value) || 0))
                        )
                      }
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Producto / SKU (opcional)</label>
                    <input
                      value={h.codigo_producto}
                      onChange={(e) => updHallazgo(h._key, 'codigo_producto', e.target.value)}
                      placeholder="SKU"
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Ubicación (opcional)</label>
                    <input
                      value={h.ubicacion}
                      onChange={(e) => updHallazgo(h._key, 'ubicacion', e.target.value)}
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Lote (opcional)</label>
                    <input
                      value={h.partida}
                      onChange={(e) => updHallazgo(h._key, 'partida', e.target.value)}
                      className={field}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className={lbl}>Consecuencia</label>
                    <input
                      value={h.consecuencia}
                      onChange={(e) => updHallazgo(h._key, 'consecuencia', e.target.value)}
                      placeholder="No apto para despacho hasta evaluación técnica"
                      className={field}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className={lbl}>Observaciones</label>
                    <input
                      value={h.observaciones}
                      onChange={(e) => updHallazgo(h._key, 'observaciones', e.target.value)}
                      className={field}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className={lbl}>Evidencia fotográfica</label>
                  <div className="mt-1.5">
                    <PhotoUploader
                      informeId={informeId}
                      itemId={h.id}
                      evidencias={evForItem(h.id)}
                      onChanged={refetchEvidencias}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cuadro resumen */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-700">4. Cuadro resumen de hallazgos</h3>
          <button
            onClick={addResumen}
            className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-slate-700"
          >
            <Plus size={14} /> Fila
          </button>
        </div>
        <div className="space-y-2">
          {(rep.cuadro_resumen || []).map((r, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={r.indicador}
                onChange={(e) => updResumen(i, 'indicador', e.target.value)}
                placeholder="Indicador (ej. Total de bultos recepcionados)"
                className={`${field} mt-0 flex-1`}
              />
              <input
                value={r.valor}
                onChange={(e) => updResumen(i, 'valor', e.target.value)}
                placeholder="Valor"
                className={`${field} mt-0 w-32`}
              />
              <button
                onClick={() => delResumen(i)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Análisis + acciones */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className={lbl}>5. Análisis y causa probable</label>
          <textarea
            rows={3}
            value={rep.analisis_causa}
            onChange={(e) => setRepField('analisis_causa', e.target.value)}
            className={field}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className={lbl}>6. Acciones recomendadas</label>
            <button
              onClick={addAccion}
              className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-slate-700"
            >
              <Plus size={14} /> Acción
            </button>
          </div>
          <div className="space-y-2 mt-1.5">
            {(rep.acciones_recomendadas || []).map((a, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={a}
                  onChange={(e) => updAccion(i, e.target.value)}
                  placeholder="Acción recomendada"
                  className={`${field} mt-0 flex-1`}
                />
                <button
                  onClick={() => delAccion(i)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Firmas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Elaborado por</label>
          <input
            value={rep.elaborado_por}
            onChange={(e) => setRepField('elaborado_por', e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label className={lbl}>Revisado por</label>
          <input
            value={rep.revisado_por}
            onChange={(e) => setRepField('revisado_por', e.target.value)}
            className={field}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => doGuardar('BORRADOR')}
          disabled={guardar.isPending}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2"
        >
          {guardar.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}{' '}
          Guardar
        </button>
        <button
          onClick={() => doGuardar('ENVIADO_CALIDAD')}
          disabled={guardar.isPending}
          className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center gap-2 hover:bg-rose-700 disabled:opacity-50"
        >
          <Send size={16} /> Guardar y enviar
        </button>
      </div>
    </div>
  );
};

// ── Detalle + dictamen (MONITOREO) ──────────────────────────────────────────
const InformeDetail = ({ informe, onBack, onEdit, onDelete }) => {
  const { hasPermission } = useAuth();
  const canDictar = hasPermission('manage_quality');
  const { data: items = [], isLoading } = useInformeItems(informe.id);
  const dictaminar = useDictaminar();
  const crearAccion = useCrearAccion();
  const { data: areas = [] } = useAreasCalidad();
  const { data: bodegasDestino = [] } = useBodegasDestino();
  const actualizarEstado = useActualizarEstadoInforme();
  const [dictForm, setDictForm] = useState({});

  const setForm = (id, patch) =>
    setDictForm((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const enviarDictamen = async (item) => {
    const f = dictForm[item.id] || {};
    if (!f.dictamen) {
      toast.error('Selecciona un dictamen');
      return;
    }
    const def = DICTAMENES.find((d) => d.id === f.dictamen);
    if (def?.mueve && !f.bodegaDestino) {
      toast.error('Indica la bodega destino');
      return;
    }
    // Validar el área ANTES de persistir el dictamen: el formulario desaparece
    // una vez dictaminado (render con !it.dictamen), así que si esto fallaba
    // después, la acción recomendada quedaba imposible de promulgar.
    if (f.tipoAccion) {
      const tdefPre = TIPOS_ACCION.find((t) => t.id === f.tipoAccion);
      if (!(f.area || tdefPre?.area)) {
        toast.error('Selecciona el área responsable de la acción');
        return;
      }
    }
    try {
      await dictaminar.mutateAsync({
        itemId: item.id,
        dictamen: f.dictamen,
        bodegaDestino: f.bodegaDestino,
        acuse: f.acuse
      });
      toast.success(
        `Dictamen registrado: ${def?.label}${def?.mueve ? ' · aviso enviado a Inventario' : ''}`
      );
      // Push a móvil (ADMIN) para dictámenes que sacan producto de circulación.
      if (['CUARENTENA', 'RECHAZAR', 'BAJA'].includes(f.dictamen)) {
        notificarDictamenPush({
          codigo: item.codigo_producto,
          ubicacion: item.ubicacion,
          estadoLabel: def?.label || f.dictamen,
          tipo: 'CALIDAD_DICTAMEN'
        });
      }
      // Promulgar la acción recomendada como tarea para el área responsable.
      if (f.tipoAccion) {
        const tdef = TIPOS_ACCION.find((t) => t.id === f.tipoAccion);
        const area = f.area || tdef?.area;
        if (!area) {
          toast.error('Selecciona el área responsable de la acción');
          return;
        }
        try {
          const ra = await crearAccion.mutateAsync({
            itemId: item.id,
            tipoAccion: f.tipoAccion,
            area,
            descripcion: f.descAccion,
            prioridad: f.prioridad || 'NORMAL'
          });
          toast.success(
            `Acción promulgada ${ra?.folio || ''} → ${areas.find((a) => a.codigo === area)?.label || area}`
          );
        } catch (e) {
          toast.error(`Dictamen OK, pero no se pudo crear la acción: ${e.message}`);
        }
      }
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
  };

  const exportar = () => {
    const detalle = items.map((it) => ({
      SKU: it.codigo_producto,
      Lote_Serie: it.partida,
      Ubicacion: it.ubicacion,
      Producto: it.producto,
      UM: it.unidad_medida,
      Cantidad: it.cantidad,
      Uds_Afectadas: it.cantidad_afectada || 0,
      No_Registrado: it.no_registrado ? 'SÍ' : '',
      Estado_Inv: it.estado_inventario,
      Tipo: it.tipo,
      Vence: it.fecha_vencimiento,
      Semaforo: it.semaforo,
      Condicion: it.condicion_observada,
      Motivo: it.motivo,
      Observaciones: it.observaciones,
      Dictamen: it.dictamen || '',
      Bodega_Destino: it.bodega_destino || '',
      Acuse: it.acuse_texto || '',
      Calidad: it.calidad_nombre || '',
      Fecha_Dictamen: it.fecha_dictamen || ''
    }));
    const cuenta = (fn) => items.filter(fn).length;
    const dictList = ['LIBERAR', 'CUARENTENA', 'REPROCESO', 'RECHAZAR', 'BAJA'];
    const condList = [...new Set(items.map((i) => i.condicion_observada).filter(Boolean))];
    const resumen = [
      { Campo: 'Informe', Valor: informe.numero },
      { Campo: 'Fecha', Valor: informe.fecha },
      { Campo: 'Bodega', Valor: informe.bodega || '—' },
      { Campo: 'Analista', Valor: informe.analista_nombre || '—' },
      { Campo: 'Estado', Valor: informe.estado },
      { Campo: 'Total ítems', Valor: items.length },
      { Campo: 'Dictaminados', Valor: cuenta((i) => i.dictamen) },
      { Campo: 'Pendientes', Valor: cuenta((i) => !i.dictamen) },
      {
        Campo: 'Con problema (cond≠OK)',
        Valor: cuenta((i) => i.condicion_observada && i.condicion_observada !== 'OK')
      },
      { Campo: 'No registrados', Valor: cuenta((i) => i.no_registrado) },
      { Campo: '— Por semáforo —', Valor: '' },
      ...['ROJO', 'NARANJA', 'VERDE', 'NA'].map((s) => ({
        Campo: `Semáforo ${s}`,
        Valor: cuenta((i) => i.semaforo === s)
      })),
      { Campo: '— Por dictamen —', Valor: '' },
      ...dictList.map((d) => ({ Campo: d, Valor: cuenta((i) => i.dictamen === d) })),
      { Campo: '— Por condición —', Valor: '' },
      ...condList.map((c) => ({ Campo: c, Valor: cuenta((i) => i.condicion_observada === c) }))
    ];
    exportToExcel({
      filename: `Monitoreo_${informe.numero}`,
      sheets: [
        { name: 'Resumen', rows: resumen },
        { name: 'Detalle', rows: detalle }
      ]
    });
  };

  const pendientes = useMemo(() => items.filter((i) => !i.dictamen).length, [items]);
  const resumen = useMemo(() => {
    const total = items.length;
    const dictaminados = items.filter((i) => i.dictamen).length;
    const noReg = items.filter((i) => i.no_registrado).length;
    const conProblema = items.filter(
      (i) => i.condicion_observada && i.condicion_observada !== 'OK'
    ).length;
    const sem = { ROJO: 0, NARANJA: 0, VERDE: 0, NA: 0 };
    items.forEach((i) => {
      sem[i.semaforo] = (sem[i.semaforo] || 0) + 1;
    });
    return {
      total,
      dictaminados,
      noReg,
      conProblema,
      sem,
      pct: total ? Math.round((dictaminados / total) * 100) : 0
    };
  }, [items]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 border border-slate-200 shadow-sm"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900">{informe.numero}</h2>
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${ESTADO_INFORME_CLS[informe.estado] || ''}`}
              >
                {informe.estado?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              {informe.fecha} · {informe.bodega || 'Sin bodega'} · {informe.analista_nombre || '—'}{' '}
              · {pendientes} pendientes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(informe)}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-50"
            >
              <Pencil size={16} /> Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(informe)}
              className="px-4 py-2.5 bg-white border border-slate-200 text-rose-600 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-rose-50"
            >
              <Trash2 size={16} /> Eliminar
            </button>
          )}
          <button
            onClick={() => exportInformeMonitoreoWord(informe, items)}
            title="Descargar Word"
            className="px-3 py-2.5 bg-white border border-slate-200 text-blue-700 rounded-xl text-sm font-black flex items-center gap-1.5 hover:bg-blue-50"
          >
            <FileText size={16} /> Word
          </button>
          <button
            onClick={() => exportInformeMonitoreoPDF(informe, items)}
            title="Descargar PDF"
            className="px-3 py-2.5 bg-white border border-slate-200 text-rose-700 rounded-xl text-sm font-black flex items-center gap-1.5 hover:bg-rose-50"
          >
            <FileType size={16} /> PDF
          </button>
          <button
            onClick={exportar}
            className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700"
          >
            <Download size={16} /> Excel
          </button>
        </div>
      </div>

      {/* Panel de resumen del informe */}
      {!isLoading && items.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-black text-slate-700">Avance del dictamen</span>
            <span className="text-xs font-bold text-slate-500 tabular-nums">
              {resumen.dictaminados}/{resumen.total} · {resumen.pct}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${resumen.pct}%` }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Ítems', value: resumen.total, cls: 'text-slate-900' },
              { label: 'Dictaminados', value: resumen.dictaminados, cls: 'text-emerald-600' },
              { label: 'Pendientes', value: pendientes, cls: 'text-amber-600' },
              { label: 'Con problema', value: resumen.conProblema, cls: 'text-orange-600' },
              { label: 'No registrados', value: resumen.noReg, cls: 'text-rose-600' }
            ].map((k) => (
              <div key={k.label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {k.label}
                </div>
                <div className={`text-2xl font-black tabular-nums ${k.cls}`}>{k.value}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {resumen.sem.ROJO > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> {resumen.sem.ROJO} vence
                &lt;30d
              </span>
            )}
            {resumen.sem.NARANJA > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> {resumen.sem.NARANJA} vence
                &lt;90d
              </span>
            )}
            {resumen.sem.VERDE > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> {resumen.sem.VERDE} vigente
              </span>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => {
            const f = dictForm[it.id] || {};
            const def = DICTAMENES.find((d) => d.id === f.dictamen);
            return (
              <div key={it.id} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${SEMAFORO_CLS[it.semaforo] || 'bg-slate-300'}`}
                    />
                    <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {it.codigo_producto}
                    </span>
                    {it.no_registrado && (
                      <span className="text-[9px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded uppercase tracking-wide">
                        No registrado
                      </span>
                    )}
                    <span className="text-slate-600 truncate">{it.producto}</span>
                    <span className="text-[10px] text-slate-400">
                      lote {it.partida || '—'} · {it.ubicacion || 's/ubic'} · {it.cantidad} uds
                    </span>
                  </div>
                  {it.dictamen ? (
                    <div className="flex items-center gap-2">
                      <CalidadBadge estado={def_estado(it.dictamen)} />
                      <span className="text-xs font-bold text-slate-500">
                        {it.dictamen}
                        {it.bodega_destino ? ` → BD ${it.bodega_destino}` : ''} ·{' '}
                        {it.calidad_nombre}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                      Pendiente
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>
                    Condición:{' '}
                    <b
                      className={
                        it.condicion_observada && it.condicion_observada !== 'OK'
                          ? 'text-amber-700'
                          : 'text-slate-700'
                      }
                    >
                      {it.condicion_observada || '—'}
                    </b>
                  </span>
                  {Number(it.cantidad_afectada) > 0 && (
                    <span>
                      Afectadas: <b className="text-amber-700">{it.cantidad_afectada} uds</b>
                    </span>
                  )}
                  <span>
                    Motivo: <b className="text-slate-700">{it.motivo || '—'}</b>
                  </span>
                  {it.observaciones && (
                    <span>
                      Obs: <b className="text-slate-700">{it.observaciones}</b>
                    </span>
                  )}
                </div>

                {canDictar && !it.dictamen && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-end gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Dictamen
                      </label>
                      <select
                        value={f.dictamen || ''}
                        onChange={(e) => setForm(it.id, { dictamen: e.target.value })}
                        className="block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400"
                      >
                        <option value="">— Elegir —</option>
                        {DICTAMENES.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {def?.mueve && (
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Bodega destino (Softland)
                        </label>
                        <select
                          value={f.bodegaDestino || ''}
                          onChange={(e) => setForm(it.id, { bodegaDestino: e.target.value })}
                          className="block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400"
                        >
                          <option value="">— Elegir —</option>
                          {bodegasDestino.map((b) => (
                            <option key={b.codigo} value={b.codigo}>
                              {b.codigo} — {b.nombre} (
                              {b.estado === 'TRANSITORIO' ? 'Transitorio' : 'Disponible'})
                            </option>
                          ))}
                          {bodegasDestino.length === 0 &&
                            BODEGAS_DESTINO.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                    <div className="flex-1 min-w-[180px]">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Acuse / nota
                      </label>
                      <input
                        value={f.acuse || ''}
                        onChange={(e) => setForm(it.id, { acuse: e.target.value })}
                        placeholder="Justificación del dictamen"
                        className="block w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
                      />
                    </div>

                    {/* Acción recomendada → tarea para un área */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Acción recomendada
                      </label>
                      <select
                        value={f.tipoAccion || ''}
                        onChange={(e) => {
                          const td = TIPOS_ACCION.find((t) => t.id === e.target.value);
                          setForm(it.id, { tipoAccion: e.target.value, area: td?.area || f.area });
                        }}
                        className="block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400"
                      >
                        <option value="">— Ninguna —</option>
                        {TIPOS_ACCION.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {f.tipoAccion && (
                      <>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Área responsable
                          </label>
                          <select
                            value={f.area || ''}
                            onChange={(e) => setForm(it.id, { area: e.target.value })}
                            className="block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400"
                          >
                            <option value="">— Elegir —</option>
                            {areas.map((a) => (
                              <option key={a.codigo} value={a.codigo}>
                                {a.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Prioridad
                          </label>
                          <select
                            value={f.prioridad || 'NORMAL'}
                            onChange={(e) => setForm(it.id, { prioridad: e.target.value })}
                            className="block mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400"
                          >
                            <option value="NORMAL">Normal</option>
                            <option value="URGENTE">Urgente</option>
                          </select>
                        </div>
                        <div className="flex-1 min-w-[180px]">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Instrucción a la acción
                          </label>
                          <input
                            value={f.descAccion || ''}
                            onChange={(e) => setForm(it.id, { descAccion: e.target.value })}
                            placeholder="Qué debe hacer el área (o la pregunta a responder)"
                            className="block w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400"
                          />
                        </div>
                      </>
                    )}

                    <button
                      onClick={() => enviarDictamen(it)}
                      disabled={dictaminar.isPending || crearAccion.isPending}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <ShieldCheck size={16} /> Dictaminar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {canDictar &&
        informe.estado === 'ENVIADO_CALIDAD' &&
        pendientes === 0 &&
        items.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={async () => {
                try {
                  await actualizarEstado.mutateAsync({
                    informeId: informe.id,
                    estado: 'DICTAMINADO'
                  });
                  toast.success('Informe marcado como dictaminado');
                  onBack();
                } catch (e) {
                  toast.error(e.message);
                }
              }}
              className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-700"
            >
              <CheckCircle2 size={16} /> Cerrar dictamen del informe
            </button>
          </div>
        )}
    </div>
  );
};

// Mapeo auxiliar dictamen → estado de calidad (para el badge en detalle).
function def_estado(dictamen) {
  const d = DICTAMENES.find((x) => x.id === dictamen);
  return d?.estado || 'LIBERADO';
}

// ── Página principal ────────────────────────────────────────────────────────
const Monitoreo = () => {
  const { hasPermission, user } = useAuth();
  const canCreate = hasPermission('manage_monitoreo') || hasPermission('manage_quality');
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const canAssign = isAdmin; // Solo ADMIN alimenta el hito 2 (asigna SKUs a Calidad)
  const { data: informes = [], isLoading } = useInformes();
  const eliminar = useEliminarInforme();
  const [mode, setMode] = useState('list'); // list | new | edit | detail | new-danos | edit-danos
  const [selected, setSelected] = useState(null);
  // Hitos del proceso de calidad, en orden: 1 Recepción · 2 Estancia · 3 Salida
  const [tab, setTab] = useState('hito1');
  const [danosPrefill, setDanosPrefill] = useState(null); // pre-carga del Informe de Daños desde un checklist NC
  const [asigPrefill, setAsigPrefill] = useState(null); // pre-carga del informe desde una asignación (hito 2)
  const [busquedaEstancia, setBusquedaEstancia] = useState('');
  const pendCount = useTareasPendientesCount();
  const asigPendCount = useAsignacionesPendientesCount();
  const salidaPendCount = useSalidaPendientesCount();
  const informesFiltrados = useMemo(() => {
    const q = busquedaEstancia.trim().toLocaleLowerCase('es-CL');
    if (!q) return informes;
    return informes.filter((inf) =>
      [
        inf.numero,
        inf.bodega,
        inf.analista_nombre,
        inf.estado,
        inf.tipo_informe,
        // Informes de daños conservan los antecedentes de OC/proveedor en reporte.
        JSON.stringify(inf.reporte || {})
      ].some((v) =>
        String(v || '')
          .toLocaleLowerCase('es-CL')
          .includes(q)
      )
    );
  }, [busquedaEstancia, informes]);

  // Realtime en las colas de checklist (hito 1) y asignaciones (hito 2): una
  // recepción o una asignación nueva refresca la cola y el badge de inmediato.
  useRealtimeTable('tms_calidad_tareas', ['calidad_tareas'], { debounceMs: 400 });
  useRealtimeTable('tms_calidad_asignaciones', ['calidad_asignaciones'], { debounceMs: 400 });

  useEffect(() => {
    if (mode === 'detail' && selected) {
      const fresh = informes.find((i) => i.id === selected.id);
      if (fresh) setSelected(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [informes]);

  const abrirInforme = (inf) => {
    setSelected(inf);
    // Los informes de Daños solo abren en modo edición para quien puede
    // gestionarlos: /quality/monitoreo también es accesible con manage_inventory
    // y ese perfil entraba directo al editor (con guardar y subir/borrar fotos).
    setMode(inf.tipo_informe === 'DANOS' && canCreate ? 'edit-danos' : 'detail');
  };
  const editarInforme = (inf) => {
    setSelected(inf);
    setMode(inf.tipo_informe === 'DANOS' ? 'edit-danos' : 'edit');
  };
  const borrarInforme = async (inf) => {
    if (!confirm(`¿Eliminar el informe ${inf.numero}? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminar.mutateAsync(inf.id);
      toast.success('Informe eliminado');
      if (selected?.id === inf.id) {
        setSelected(null);
        setMode('list');
      }
    } catch (e) {
      toast.error(`No se pudo eliminar: ${e.message}`);
    }
  };
  const volver = () => {
    setMode('list');
    setSelected(null);
    setDanosPrefill(null);
    setAsigPrefill(null);
  };

  // Desde una tarea de checklist NO CONFORME: abre el Informe de Daños pre-cargado.
  const generarDanosDesdeChecklist = (tarea) => {
    setSelected(null);
    setDanosPrefill({
      proveedor: tarea.proveedor,
      oc: tarea.oc,
      origen: tarea.origen,
      fecha_recepcion: tarea.fecha_recepcion,
      recepcion_id: tarea.recepcion_id,
      tarea_id: tarea.id
    });
    setTab('hito2');
    setMode('new-danos');
  };

  // Hito 2: desde una asignación de Inventario, abre el Informe de Monitoreo
  // pre-cargado con los SKUs; al guardarlo, la asignación queda resuelta.
  const generarInformeDesdeAsignacion = async (asig) => {
    try {
      const locked = await tomarAsignacionCalidad(asig.id);
      setSelected(null);
      setAsigPrefill({ ...asig, ...locked });
      setTab('hito2');
      setMode('new');
    } catch (error) {
      toast.error(error?.message || 'No se pudo abrir la tarea de Calidad');
    }
  };

  return (
    <div className="h-full bg-slate-50 p-3 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm p-5 sm:p-7 mb-5 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <ClipboardCheck size={30} strokeWidth={2.4} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Módulo de <span className="text-emerald-600">Calidad</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm">
              Proceso por hitos: Recepción · Estancia · Salida
            </p>
          </div>
        </div>
        {mode === 'list' && tab === 'hito2' && canCreate && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelected(null);
                setMode('new');
              }}
              className="px-5 py-3 bg-emerald-600 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
            >
              <Plus size={20} /> Monitoreo
            </button>
            <button
              onClick={() => {
                setSelected(null);
                setMode('new-danos');
              }}
              className="px-5 py-3 bg-rose-600 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-rose-600/20 hover:bg-rose-700"
            >
              <AlertTriangle size={20} /> Informe de Daños
            </button>
          </div>
        )}
      </div>

      {/* Hitos del proceso de Calidad, en orden */}
      {mode === 'list' && (
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            {
              id: 'hito1',
              n: 1,
              label: 'Recepción',
              sub: 'Ingreso a bodega',
              icon: PackageSearch,
              badge: pendCount
            },
            {
              id: 'hito2',
              n: 2,
              label: 'Estancia',
              sub: 'Producto en almacenamiento',
              icon: Boxes,
              badge: asigPendCount
            },
            {
              id: 'hito3',
              n: 3,
              label: 'Salida',
              sub: 'Despacho',
              icon: Truck,
              badge: salidaPendCount
            }
          ].map((h) => {
            const Icon = h.icon;
            const active = tab === h.id;
            return (
              <button
                key={h.id}
                onClick={() => setTab(h.id)}
                className={`px-4 py-2.5 rounded-xl font-black text-sm border transition-colors flex items-center gap-2.5 ${active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}
                >
                  {h.n}
                </span>
                <Icon size={16} className="shrink-0" />
                <span className="flex flex-col items-start leading-tight">
                  <span>{h.label}</span>
                  <span
                    className={`text-[9px] font-bold ${active ? 'text-white/70' : 'text-slate-400'}`}
                  >
                    {h.sub}
                  </span>
                </span>
                {h.badge > 0 && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700'}`}
                  >
                    {h.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Hito 1 — Recepción (CheckList de ingreso) */}
      {mode === 'list' && tab === 'hito1' && (
        <ChecklistIngreso onGenerarDanos={generarDanosDesdeChecklist} />
      )}

      {/* Hito 3 — Salida (Certificado de Conformidad de despacho) */}
      {mode === 'list' && tab === 'hito3' && <SalidaCertificacion />}

      {mode === 'new' && (
        <InformeBuilder
          prefillItems={asigPrefill?.skus}
          asignacion={asigPrefill}
          onCancel={volver}
          onSaved={volver}
        />
      )}
      {mode === 'edit' && selected && (
        <InformeBuilder informe={selected} onCancel={volver} onSaved={volver} />
      )}
      {mode === 'new-danos' && (
        <InformeDanosBuilder prefill={danosPrefill} onCancel={volver} onSaved={volver} />
      )}
      {mode === 'edit-danos' && selected && (
        <InformeDanosBuilder informe={selected} onCancel={volver} onSaved={volver} />
      )}
      {mode === 'detail' && selected && (
        <InformeDetail
          informe={selected}
          onBack={volver}
          onEdit={canCreate ? editarInforme : null}
          onDelete={canCreate ? borrarInforme : null}
        />
      )}

      {/* Hito 2 — Estancia: asignaciones de Inventario + informes/dictámenes */}
      {mode === 'list' && tab === 'hito2' && (
        <AsignacionesPanel
          canAssign={canAssign}
          canManageQuality={canCreate}
          onGenerarInforme={generarInformeDesdeAsignacion}
        />
      )}

      {mode === 'list' && tab === 'hito2' && (
        <>
          <div className="mb-3 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">
                  Hito 2 · Estancia
                </p>
                <h3 className="mt-0.5 text-base font-black text-slate-800 flex items-center gap-2">
                  <FileSearch size={16} className="text-emerald-500" /> Informes y dictámenes
                </h3>
                <p className="text-xs text-slate-500">
                  Busca por OC, proveedor, número de informe, bodega o analista.
                </p>
              </div>
              {!isLoading && (
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-slate-500 border border-slate-200">
                  {informesFiltrados.length} / {informes.length}
                </span>
              )}
            </div>
            <label className="relative mt-3 block">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={busquedaEstancia}
                onChange={(e) => setBusquedaEstancia(e.target.value)}
                placeholder="Buscar OC, proveedor, informe, bodega o analista…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </label>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-emerald-500" size={36} />
            </div>
          ) : informes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileSearch size={44} className="text-slate-200 mb-4" />
              <h3 className="text-base font-bold text-slate-400">Sin informes de monitoreo</h3>
              <p className="text-xs text-slate-300">
                {canCreate
                  ? 'Crea el primero con “Monitoreo” o “Informe de Daños”, o desde una asignación de Inventario.'
                  : 'Aún no hay informes generados.'}
              </p>
            </div>
          ) : informesFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
              <Search size={34} className="mx-auto mb-3 text-slate-300" />
              <h3 className="font-bold text-slate-500">No hay informes que coincidan</h3>
              <button
                onClick={() => setBusquedaEstancia('')}
                className="mt-2 text-xs font-black text-sky-600 hover:text-sky-700"
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {informesFiltrados.map((inf) => {
                const esDanos = inf.tipo_informe === 'DANOS';
                return (
                  <div
                    key={inf.id}
                    className="text-left bg-white rounded-2xl border border-slate-200 p-5 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <button
                        onClick={() => abrirInforme(inf)}
                        className="font-black text-slate-900 hover:text-emerald-600 truncate"
                      >
                        {inf.numero}
                      </button>
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0 ${ESTADO_INFORME_CLS[inf.estado] || ''}`}
                      >
                        {inf.estado?.replace('_', ' ')}
                      </span>
                    </div>
                    <button onClick={() => abrirInforme(inf)} className="block w-full text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${TIPO_CLS[inf.tipo_informe] || TIPO_CLS.MONITOREO}`}
                        >
                          {esDanos ? 'Daños' : 'Monitoreo'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">
                        {inf.fecha} · {inf.bodega || 'Sin bodega'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {inf.analista_nombre || '—'} · {inf.total_items} ítems · {inf.periodicidad}
                      </p>
                    </button>
                    {canCreate && (
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => editarInforme(inf)}
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-black flex items-center justify-center gap-1.5 hover:bg-slate-50"
                        >
                          <Pencil size={14} /> Editar
                        </button>
                        <button
                          onClick={() => borrarInforme(inf)}
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-rose-600 text-xs font-black flex items-center justify-center gap-1.5 hover:bg-rose-50"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Monitoreo;
