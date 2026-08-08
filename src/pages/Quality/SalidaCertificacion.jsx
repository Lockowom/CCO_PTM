import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  Truck,
  ArrowLeft,
  Loader2,
  Check,
  X,
  Minus,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  FileDown,
  FileText,
  PenLine,
  BadgeCheck,
  RefreshCw,
  Search,
  Plus,
  Package,
  Ban,
  Trash2,
  PencilLine,
  Scale,
  Camera,
  Boxes,
  ImagePlus,
  Building2,
  ClipboardCheck,
  Hash
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  CHECKLIST_SALIDA_NIVELES,
  CHECKLIST_SALIDA_TODOS,
  DISPOSICIONES_SALIDA,
  ESTADO_TAREA_META,
  useTareasSalida,
  useCrearTareaSalidaManual,
  useGuardarChecklist,
  useFirmarCertificado,
  fetchCandidatosSalida,
  useEliminarTareaCalidad,
  RIESGOS_SALIDA,
  EVIDENCIAS_SALIDA_TIPOS,
  resultadoPeso,
  semaforoSalida,
  SEMAFORO_SALIDA,
  uploadEvidenciaSalida,
  deleteEvidenciaSalida,
  EVIDENCIAS_BUCKET,
  EVIDENCIA_OPCIONES
} from '../../services/calidadService';
import { fetchNvPanel } from '../../services/panelPtm';
import { opciones as fetchPanelOptions } from '../Panel/ingresar/ingresarService';
import { compressImage } from '../../lib/imageCompress';
import { signedUrl, signedUrls } from '../../lib/storageUrl';
import CameraCapture from '../../components/CameraCapture';
import { exportChecklistPDF, exportChecklistWord } from '../../lib/exportChecklistIngreso';

// ── Modal: certificación de salida MANUAL (N.V. a mano + SKUs) ──────────────
const ManualModal = ({ onClose, onCreated }) => {
  const crear = useCrearTareaSalidaManual();
  const [nv, setNv] = useState('');
  const [cliente, setCliente] = useState('');
  const [guia, setGuia] = useState('');
  const [transportista, setTransportista] = useState('');
  const [transportistasOpts, setTransportistasOpts] = useState([]);
  const [cargandoTransportistas, setCargandoTransportistas] = useState(true);
  const [bultos, setBultos] = useState('');
  const [query, setQuery] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [cand, setCand] = useState([]);
  const [sel, setSel] = useState([]);
  const [panelInfo, setPanelInfo] = useState(null);
  const [buscandoNv, setBuscandoNv] = useState(false);
  const [nvLookupError, setNvLookupError] = useState('');
  const nvLookupIdRef = useRef(0);
  const lastNvLookupRef = useRef('');

  // Comparte la fuente y la caché del formulario Ingresar N.V. para que
  // ambos módulos trabajen siempre con el mismo catálogo maestro activo.
  useEffect(() => {
    let mounted = true;
    setCargandoTransportistas(true);
    fetchPanelOptions()
      .then((options) => {
        if (mounted) setTransportistasOpts(options?.transportistas || []);
      })
      .catch((error) => {
        if (mounted)
          toast.error(`No se pudo cargar el catálogo de transportistas: ${error.message}`);
      })
      .finally(() => {
        if (mounted) setCargandoTransportistas(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const transportistasDisponibles = useMemo(() => {
    if (transportista && !transportistasOpts.includes(transportista)) {
      return [transportista, ...transportistasOpts];
    }
    return transportistasOpts;
  }, [transportista, transportistasOpts]);

  // Trae los datos de la N.V desde el Panel Dashboard PTM y autollena el
  // formulario (cliente, guía, transportista, bultos) + tarjeta informativa.
  const traerDelPanel = useCallback(
    async ({ silent = false, force = false } = {}) => {
      if (!nv.trim()) {
        if (!silent) toast.error('Escribe primero el número de N.V.');
        return;
      }
      const nvActual = nv.trim();
      if (!force && lastNvLookupRef.current === nvActual) return;
      const requestId = ++nvLookupIdRef.current;
      setBuscandoNv(true);
      setNvLookupError('');
      try {
        const info = await fetchNvPanel(nvActual);
        if (requestId !== nvLookupIdRef.current) return;
        lastNvLookupRef.current = nvActual;
        if (!info) {
          setPanelInfo(null);
          setCliente('');
          setNvLookupError(`La N.V. ${nvActual} no existe en el Panel PTM.`);
          if (!silent) toast.error(`La N.V. ${nvActual} no fue encontrada.`);
          return;
        }
        setPanelInfo(info);
        setCliente(info.cliente || '');
        setGuia(info.guia || '');
        setTransportista(info.transportista || '');
        setBultos(info.bultos || '');
        if (!info.cliente) setNvLookupError(`La N.V. ${info.nv} no tiene un cliente asociado.`);
        if (!silent) toast.success(`N.V ${info.nv} encontrada: cliente cargado automáticamente`);
      } catch (e) {
        if (requestId !== nvLookupIdRef.current) return;
        setPanelInfo(null);
        setCliente('');
        setNvLookupError(`No se pudo consultar la N.V.: ${e.message}`);
        if (!silent) toast.error(`No se pudo consultar el Panel PTM: ${e.message}`);
      } finally {
        if (requestId === nvLookupIdRef.current) setBuscandoNv(false);
      }
    },
    [nv]
  );

  // El cliente se obtiene automáticamente al terminar de escribir la N.V.; no
  // existe entrada manual para evitar diferencias con la fuente oficial.
  useEffect(() => {
    if (nv.length < 3) return undefined;
    const timer = window.setTimeout(() => traerDelPanel({ silent: true }), 650);
    return () => window.clearTimeout(timer);
  }, [nv, traerDelPanel]);

  const cambiarNv = (value) => {
    const normalizada = String(value || '').replace(/[^0-9]/g, '');
    if (normalizada === nv) return;
    nvLookupIdRef.current += 1;
    lastNvLookupRef.current = '';
    setNv(normalizada);
    setPanelInfo(null);
    setCliente('');
    setGuia('');
    setTransportista('');
    setBultos('');
    setNvLookupError('');
    setBuscandoNv(false);
  };

  // Para el despacho la ubicación no aporta: se agrupa el stock por SKU+partida
  // (sumando el disponible de todas las ubicaciones) y no se muestra ubicación.
  const agruparPorSku = (lista) => {
    const m = new Map();
    (lista || []).forEach((c) => {
      const k = `${c.codigo_producto}|${c.partida || ''}`;
      const prev = m.get(k);
      if (prev) prev.disponible = Number(prev.disponible || 0) + (Number(c.disponible) || 0);
      else m.set(k, { ...c, ubicacion: '', disponible: Number(c.disponible) || 0 });
    });
    return [...m.values()];
  };

  const buscar = useCallback(async () => {
    setBuscando(true);
    try {
      setCand(agruparPorSku(await fetchCandidatosSalida(query)));
    } catch (e) {
      toast.error(`Error buscando stock: ${e.message}`);
    } finally {
      setBusquedaRealizada(true);
      setBuscando(false);
    }
  }, [query]);

  const keyOf = (c) => `${c.codigo_producto}|${c.partida || ''}`;
  const add = (c) => {
    const k = keyOf(c);
    if (sel.some((s) => s._key === k)) {
      toast.info('Ese SKU ya está agregado');
      return;
    }
    setSel((prev) => [
      ...prev,
      {
        _key: k,
        codigo_producto: c.codigo_producto,
        producto: c.producto || '',
        ubicacion: '',
        partida: c.partida || '',
        // Los SKU históricos no tienen stock WMS: se inicia en 1 y el usuario
        // puede indicar la cantidad real del despacho antes de crear la tarea.
        cantidad: Number(c.disponible) > 0 ? Number(c.disponible) : 1,
        unidad_medida: c.unidad_medida || 'UN'
      }
    ]);
  };
  const remove = (k) => setSel((prev) => prev.filter((s) => s._key !== k));

  const crearCert = async () => {
    if (!nv.trim()) {
      toast.error('Escribe la N.V.');
      return;
    }
    if (!panelInfo || !cliente.trim()) {
      toast.error('Primero valida la N.V. para cargar el cliente desde el Panel PTM.');
      return;
    }
    if (sel.length === 0) {
      toast.error('Agrega al menos un SKU');
      return;
    }
    try {
      const skus = sel.map(({ _key, ...rest }) => rest);
      const r = await crear.mutateAsync({
        nv: nv.trim(),
        skus,
        cliente: cliente.trim() || null,
        guia: guia.trim() || null,
        transportista: transportista.trim() || null,
        bultos: bultos ? Number(bultos) : null
      });
      toast.success('Certificación de salida creada');
      onCreated(r?.id);
    } catch (e) {
      toast.error(`No se pudo crear: ${e.message}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-2 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative overflow-hidden border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-indigo-50 px-5 py-5 sm:px-7">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                <ClipboardCheck size={23} />
              </div>
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">
                    Calidad · Hito 3
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                  Nueva certificación de salida
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Valida la N.V., confirma el despacho y agrega sus productos.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white/80 text-slate-400 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/80 p-4 sm:p-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-950 text-xs font-black text-white">
                01
              </span>
              <div>
                <h4 className="text-sm font-black text-slate-900">Identificación del despacho</h4>
                <p className="text-[11px] text-slate-400">
                  El cliente se obtiene exclusivamente desde el Panel PTM.
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Número de N.V. <span className="text-rose-500">*</span>
                </label>
                <div
                  className={`flex h-12 items-center overflow-hidden rounded-xl border bg-white transition ${
                    nvLookupError
                      ? 'border-rose-300 ring-4 ring-rose-50'
                      : panelInfo
                        ? 'border-emerald-300 ring-4 ring-emerald-50'
                        : 'border-slate-200 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50'
                  }`}
                >
                  <Hash size={17} className="ml-3 shrink-0 text-slate-400" />
                  <input
                    value={nv}
                    onChange={(e) => cambiarNv(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && traerDelPanel({ silent: false, force: true })
                    }
                    inputMode="numeric"
                    placeholder="Ej. 97621"
                    className="min-w-0 flex-1 bg-transparent px-2 text-base font-black text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-300"
                  />
                  <button
                    onClick={() => traerDelPanel({ silent: false, force: true })}
                    disabled={buscandoNv || !nv.trim()}
                    title="Validar N.V. en el Panel PTM"
                    className="mr-1 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {buscandoNv ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : panelInfo ? (
                      <Check size={17} />
                    ) : (
                      <Search size={17} />
                    )}
                  </button>
                </div>
                <div className="mt-1.5 min-h-4 text-[10px] font-semibold">
                  {buscandoNv ? (
                    <span className="text-indigo-600">Buscando N.V. y cargando cliente…</span>
                  ) : nvLookupError ? (
                    <span className="text-rose-600">{nvLookupError}</span>
                  ) : panelInfo ? (
                    <span className="text-emerald-600">N.V. validada correctamente</span>
                  ) : (
                    <span className="text-slate-400">La consulta se realiza automáticamente.</span>
                  )}
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                    Cliente
                  </label>
                  <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-indigo-500">
                    <ShieldCheck size={11} /> Automático · no editable
                  </span>
                </div>
                <div
                  className={`flex h-12 items-center gap-3 rounded-xl border px-3.5 ${
                    cliente
                      ? 'border-emerald-200 bg-emerald-50/70'
                      : 'border-slate-200 bg-slate-100/70'
                  }`}
                  title={cliente || 'Se cargará al validar la N.V.'}
                >
                  <Building2
                    size={18}
                    className={cliente ? 'shrink-0 text-emerald-600' : 'shrink-0 text-slate-400'}
                  />
                  <span
                    className={`truncate text-sm font-bold ${cliente ? 'text-slate-800' : 'text-slate-400'}`}
                  >
                    {cliente || 'Se cargará desde la N.V. seleccionada'}
                  </span>
                  {cliente && (
                    <BadgeCheck size={17} className="ml-auto shrink-0 text-emerald-600" />
                  )}
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400">
                  Fuente oficial: Panel PTM. No admite ingreso manual.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Guía
                </label>
                <input
                  value={guia}
                  onChange={(e) => setGuia(e.target.value)}
                  placeholder="Sin guía"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Bultos
                </label>
                <input
                  value={bultos}
                  onChange={(e) => setBultos(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  inputMode="numeric"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  Transportista
                </label>
                <select
                  value={transportista}
                  onChange={(e) => setTransportista(e.target.value)}
                  disabled={cargandoTransportistas}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {cargandoTransportistas ? 'Cargando…' : '— Seleccionar —'}
                  </option>
                  {transportistasDisponibles.map((nombre) => (
                    <option key={nombre} value={nombre}>
                      {nombre}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[9px] text-slate-400">Mismo catálogo de Ingresar N.V.</p>
              </div>
            </div>

            {panelInfo && (
              <div className="mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-slate-50 p-3.5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-indigo-700">
                    <BadgeCheck size={15} /> Datos sincronizados con Panel PTM
                  </span>
                  <span className="flex items-center gap-1.5">
                    {panelInfo.urgente && (
                      <span className="rounded-md border border-rose-200 bg-rose-100 px-2 py-1 text-[9px] font-black text-rose-700">
                        URGENTE
                      </span>
                    )}
                    {panelInfo.estado && (
                      <span className="rounded-md border border-indigo-200 bg-white px-2 py-1 text-[9px] font-black text-indigo-700">
                        {panelInfo.estado}
                      </span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
                  {[
                    ['Vendedor', panelInfo.vendedor],
                    ['Compromiso', panelInfo.fechaCompromiso?.split('-').reverse().join('-')],
                    ['División', panelInfo.division],
                    ['Centro de costo', panelInfo.centroCosto],
                    ['Factura', panelInfo.factura],
                    ['N° envío', panelInfo.numeroEnvio],
                    ['Tipo despacho', panelInfo.tipoDespacho],
                    ['Fecha despacho', panelInfo.fechaDespacho?.split('-').reverse().join('-')]
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div
                        key={label}
                        className="min-w-0 rounded-xl border border-white bg-white/70 px-2.5 py-2"
                      >
                        <span className="block text-[9px] font-black uppercase tracking-wide text-slate-400">
                          {label}
                        </span>
                        <span
                          className="mt-0.5 block truncate font-bold text-slate-700"
                          title={value}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-950 text-xs font-black text-white">
                  02
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Productos del despacho</h4>
                  <p className="text-[11px] text-slate-400">
                    Busca por código o descripción, incluso SKU antiguos.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                {sel.length} seleccionado{sel.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50">
                <Search size={17} className="shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscar()}
                  placeholder="SKU actual o antiguo…"
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={buscar}
                disabled={buscando}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {buscando ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Buscar producto
              </button>
            </div>

            {cand.length > 0 && (
              <div className="mt-3 max-h-52 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                {cand.map((c, i) => (
                  <button
                    key={`${c.codigo_producto}-${c.partida || ''}-${i}`}
                    onClick={() => add(c)}
                    className="group flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition hover:bg-emerald-50/70"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black text-slate-800">
                        {c.codigo_producto}
                      </span>
                      <span className="block truncate text-xs text-slate-500">{c.producto}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                        <span>{c.partida || 'Sin partida'}</span>
                        <span>·</span>
                        <span>
                          {c.disponible} {c.unidad_medida} disponibles
                        </span>
                        {c.es_historico && (
                          <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-bold text-amber-700">
                            Histórico
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                      <Plus size={16} />
                    </span>
                  </button>
                ))}
              </div>
            )}

            {busquedaRealizada && !buscando && cand.length === 0 && (
              <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center">
                <Package size={21} className="mx-auto mb-1.5 text-slate-300" />
                <p className="text-xs font-bold text-slate-500">
                  No encontramos productos para esa búsqueda.
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Verifica el código o prueba con parte de la descripción.
                </p>
              </div>
            )}

            <div className="mt-4 border-t border-slate-100 pt-4">
              {sel.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-7 text-center">
                  <Boxes size={25} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-black text-slate-600">Aún no hay SKU en el despacho</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Busca un producto y presiona + para agregarlo.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sel.map((s, index) => (
                    <div
                      key={s._key}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:flex-row sm:items-center"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-[11px] font-black text-slate-500 shadow-sm">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-slate-800">
                          {s.codigo_producto} · {s.producto}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {s.partida || 'Sin partida'} · {s.unidad_medida}
                        </span>
                      </span>
                      <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wide text-slate-500">
                        Cantidad
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={s.cantidad}
                          onChange={(e) => {
                            const cantidad = Math.max(1, Number(e.target.value) || 1);
                            setSel((prev) =>
                              prev.map((item) =>
                                item._key === s._key ? { ...item, cantidad } : item
                              )
                            );
                          }}
                          className="h-9 w-20 rounded-lg border border-slate-200 bg-white px-2 text-center text-sm font-bold text-slate-800 outline-none focus:border-emerald-400"
                        />
                      </label>
                      <button
                        onClick={() => remove(s._key)}
                        aria-label={`Quitar ${s.codigo_producto}`}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
            <span
              className={`rounded-full px-2.5 py-1 ${panelInfo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
            >
              {panelInfo ? '✓' : '1'} N.V. validada
            </span>
            <span
              className={`rounded-full px-2.5 py-1 ${cliente ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
            >
              {cliente ? '✓' : '2'} Cliente cargado
            </span>
            <span
              className={`rounded-full px-2.5 py-1 ${sel.length ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
            >
              {sel.length ? '✓' : '3'} {sel.length} SKU
            </span>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={crearCert}
              disabled={crear.isPending || !panelInfo || !cliente.trim() || sel.length === 0}
              className="flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200 disabled:shadow-none"
            >
              {crear.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}
              Crear certificación
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

// ── Formulario de certificación de una salida ───────────────────────────────
const SalidaForm = ({ tarea, onBack, canManage }) => {
  const guardar = useGuardarChecklist();
  const firmar = useFirmarCertificado();
  const finalizada = tarea.estado === 'CONFORME' || tarea.estado === 'NO_CONFORME';
  const readOnly = finalizada || !canManage;
  const ctx = tarea.contexto || {};

  // El checklist jsonb guarda las respuestas por ítem y, bajo `_extras`, los
  // datos complementarios del certificado (pesos, bultos, riesgos, evidencias).
  const partir = (chk) => {
    const { _extras, ...resp } = chk || {};
    return { resp, extras: _extras || {} };
  };
  const [answers, setAnswers] = useState(() => partir(tarea.checklist).resp);
  const [extras, setExtras] = useState(() => partir(tarea.checklist).extras);
  const [obs, setObs] = useState(tarea.observaciones || '');
  const [disp, setDisp] = useState(tarea.disposicion || '');
  useEffect(() => {
    const { resp, extras: ex } = partir(tarea.checklist);
    setAnswers(resp);
    setExtras(ex);
    setObs(tarea.observaciones || '');
    setDisp(tarea.disposicion || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tarea.id]);

  const setResp = (pid, estado) =>
    setAnswers((prev) => ({ ...prev, [pid]: { ...prev[pid], estado } }));
  const setNota = (pid, nota) => setAnswers((prev) => ({ ...prev, [pid]: { ...prev[pid], nota } }));
  const setEvid = (pid, evidencia) =>
    setAnswers((prev) => ({ ...prev, [pid]: { ...prev[pid], evidencia } }));
  const setEx = (k, v) => setExtras((prev) => ({ ...prev, [k]: v }));

  const { answeredAll, hasNo, faltan } = useMemo(() => {
    let answered = 0,
      no = false;
    for (const p of CHECKLIST_SALIDA_TODOS) {
      const e = answers[p.id]?.estado;
      if (e) answered++;
      if (e === 'NO') no = true;
    }
    return {
      answeredAll: answered === CHECKLIST_SALIDA_TODOS.length,
      hasNo: no,
      faltan: CHECKLIST_SALIDA_TODOS.length - answered
    };
  }, [answers]);

  const descargar = async (fmt) => {
    try {
      const opts = { tipo: 'SALIDA' };
      if (fmt === 'pdf') {
        // Incrustar la evidencia fotográfica en el PDF (URLs firmadas → dataURL).
        const evs = partir(tarea.checklist).extras.evidencias || extras.evidencias || [];
        const imgs = [];
        for (const ev of evs) {
          try {
            const u = await signedUrl(EVIDENCIAS_BUCKET, ev.path);
            if (!u) continue;
            const blob = await fetch(u).then((r) => (r.ok ? r.blob() : null));
            if (!blob || !/image\/(jpeg|png)/.test(blob.type)) continue;
            const dataUrl = await new Promise((res, rej) => {
              const fr = new FileReader();
              fr.onload = () => res(fr.result);
              fr.onerror = rej;
              fr.readAsDataURL(blob);
            });
            imgs.push({ tipo: ev.tipo, dataUrl });
          } catch {
            /* foto no disponible: continúa sin ella */
          }
        }
        opts.evidenciasImg = imgs;
        await exportChecklistPDF(tarea, CHECKLIST_SALIDA_NIVELES, opts);
      } else {
        await exportChecklistWord(tarea, CHECKLIST_SALIDA_NIVELES, opts);
      }
    } catch (e) {
      toast.error(`No se pudo generar el documento: ${e.message}`);
    }
  };

  const firmarDoc = async () => {
    if (
      !confirm(
        '¿Firmar digitalmente este certificado de salida? Quedará sellado y verificable por folio/QR.'
      )
    )
      return;
    try {
      const r = await firmar.mutateAsync(tarea.id);
      toast.success(`Documento firmado por ${r?.firmado_nombre || ''}`);
    } catch (e) {
      toast.error(`No se pudo firmar: ${e.message}`);
    }
  };

  const checklistCompleto = (ex = extras) => ({ ...answers, _extras: ex });

  const guardarAvance = async () => {
    try {
      await guardar.mutateAsync({
        tareaId: tarea.id,
        checklist: checklistCompleto(),
        observaciones: obs,
        disposicion: disp,
        finalizar: false
      });
      toast.success('Avance guardado');
    } catch (e) {
      toast.error(`No se pudo guardar: ${e.message}`);
    }
  };

  const finalizar = async () => {
    if (!answeredAll) {
      toast.error(`Faltan ${faltan} ítem(s) por responder`);
      return;
    }
    const resultado = hasNo ? 'NO_CONFORME' : 'CONFORME';
    if (resultado === 'NO_CONFORME' && !disp) {
      toast.error('Selecciona la disposición antes de finalizar');
      return;
    }
    if (
      !confirm(
        resultado === 'CONFORME'
          ? 'Todos los ítems conformes → se emitirá el CERTIFICADO DE CONFORMIDAD DE SALIDA (folio CERT-SAL-) y la tarea quedará bloqueada. ¿Continuar?'
          : `Hay ítems NO conformes → SALIDA NO CONFORME (folio ACTA-SAL-), disposición "${disp}". No despachar hasta resolver. ¿Continuar?`
      )
    )
      return;
    try {
      const res = await guardar.mutateAsync({
        tareaId: tarea.id,
        checklist: checklistCompleto(),
        observaciones: obs,
        disposicion: disp,
        finalizar: true,
        resultado
      });
      if (resultado === 'CONFORME') {
        toast.success(`Salida certificada ${res?.folio || ''}`);
        onBack();
      } else toast.warning('Salida NO CONFORME. No despachar hasta resolver.');
    } catch (e) {
      toast.error(`No se pudo finalizar: ${e.message}`);
    }
  };

  // Evidencias fotográficas: suben al bucket privado y se auto-guardan en la
  // tarea (así no quedan fotos huérfanas si el usuario no aprieta Guardar).
  const fotoRef = useRef(null);
  const [camOpen, setCamOpen] = useState(false);
  // Botón de cámara solo en equipos táctiles (móvil/tablet/app).
  const puedeCamara = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
  const [tipoFoto, setTipoFoto] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [fotoUrls, setFotoUrls] = useState({});
  const evidencias = extras.evidencias || [];
  useEffect(() => {
    let on = true;
    signedUrls(
      EVIDENCIAS_BUCKET,
      evidencias.map((ev) => ev.path)
    ).then((m) => {
      if (on) setFotoUrls(m);
    });
    return () => {
      on = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(evidencias.map((ev) => ev.path))]);

  const pedirFoto = (tipo, modo = 'galeria') => {
    setTipoFoto(tipo);
    if (modo === 'camara') setCamOpen(true);
    else fotoRef.current?.click();
  };
  const onFotos = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length || !tipoFoto) return;
    setSubiendoFoto(true);
    try {
      const nuevas = [];
      for (const f of files) {
        if (!f.type.startsWith('image/')) continue;
        const blob = await compressImage(f);
        const path = await uploadEvidenciaSalida({ tareaId: tarea.id, tipo: tipoFoto, blob });
        nuevas.push({ tipo: tipoFoto, path, subido_en: new Date().toISOString() });
      }
      if (nuevas.length) {
        const nx = { ...extras, evidencias: [...evidencias, ...nuevas] };
        setExtras(nx);
        await guardar.mutateAsync({
          tareaId: tarea.id,
          checklist: checklistCompleto(nx),
          observaciones: obs,
          disposicion: disp,
          finalizar: false
        });
        toast.success(
          nuevas.length > 1 ? 'Fotos agregadas al certificado' : 'Foto agregada al certificado'
        );
      }
    } catch (err) {
      toast.error(
        err?.message?.includes('row-level security')
          ? 'No tienes permiso para subir fotos'
          : `Error al subir: ${err.message}`
      );
    } finally {
      setSubiendoFoto(false);
      setTipoFoto(null);
    }
  };
  const borrarFoto = async (ev) => {
    if (!confirm('¿Eliminar esta foto del certificado?')) return;
    try {
      await deleteEvidenciaSalida(ev.path);
      const nx = { ...extras, evidencias: evidencias.filter((x) => x.path !== ev.path) };
      setExtras(nx);
      await guardar.mutateAsync({
        tareaId: tarea.id,
        checklist: checklistCompleto(nx),
        observaciones: obs,
        disposicion: disp,
        finalizar: false
      });
      toast.success('Foto eliminada');
    } catch {
      toast.error('No se pudo eliminar la foto');
    }
  };

  // Riesgos evaluados (NINGUNO es exclusivo).
  const toggleRiesgo = (id) =>
    setExtras((prev) => {
      const cur = new Set(prev.riesgos || []);
      if (id === 'NINGUNO') return { ...prev, riesgos: cur.has('NINGUNO') ? [] : ['NINGUNO'] };
      cur.delete('NINGUNO');
      if (cur.has(id)) cur.delete(id);
      else cur.add(id);
      return { ...prev, riesgos: [...cur] };
    });

  // Bultos: etiquetas por bulto (Bulto i/N — Etiqueta OK).
  const bultosTotal = Number(extras.bultosTotal ?? tarea.bultos) || 0;
  const etiquetas = Array.isArray(extras.bultosEtiquetas) ? extras.bultosEtiquetas : [];
  const toggleEtiqueta = (i) => {
    const nx = Array.from({ length: bultosTotal }, (_, k) => !!etiquetas[k]);
    nx[i] = !nx[i];
    setEx('bultosEtiquetas', nx);
  };

  // Pesos.
  const pesos = extras.pesos || {};
  const resPeso = resultadoPeso(pesos.esperado, pesos.registrado);

  // Semáforo en vivo (mientras se edita) o el del resultado final.
  const sem = finalizada
    ? semaforoSalida(tarea)
    : !answeredAll
      ? { key: 'PENDIENTE', ...SEMAFORO_SALIDA.PENDIENTE }
      : hasNo
        ? disp === 'Despachar con salvedades (autorizado)'
          ? { key: 'NARANJA', ...SEMAFORO_SALIDA.NARANJA }
          : { key: 'ROJO', ...SEMAFORO_SALIDA.ROJO }
        : { key: 'VERDE', ...SEMAFORO_SALIDA.VERDE };

  const RespBtn = ({ pid, val, icon, activeCls }) => {
    const active = answers[pid]?.estado === val;
    return (
      <button
        type="button"
        disabled={readOnly}
        onClick={() => setResp(pid, val)}
        className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shrink-0
          ${active ? activeCls : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'} ${readOnly ? 'opacity-60 cursor-default' : ''}`}
      >
        {icon}
      </button>
    );
  };

  const meta = ESTADO_TAREA_META[tarea.estado] || {};

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-4 hover:text-slate-800"
      >
        <ArrowLeft size={18} /> Volver a la cola
      </button>

      {/* Cabecera del despacho */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Truck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-slate-900">
                {tarea.proveedor || ctx.cliente || 'Sin cliente'}
              </span>
              <span
                className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${meta.cls || ''}`}
              >
                {meta.label || tarea.estado}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-3 flex-wrap">
              <span>NV {tarea.oc || ctx.nv || '—'}</span>
              <span>Guía {ctx.guia || '—'}</span>
              {ctx.factura && <span>Factura {ctx.factura}</span>}
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {tarea.fecha_recepcion || '—'}
              </span>
              {tarea.bultos != null && <span>· {tarea.bultos} bultos</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {tarea.folio && (
            <div className="text-right">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                Certificado
              </p>
              <p className="font-mono font-black text-emerald-700">{tarea.folio}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => descargar('pdf')}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50"
            >
              <FileDown size={15} /> PDF
            </button>
            <button
              onClick={() => descargar('word')}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50"
            >
              <FileText size={15} /> Word
            </button>
          </div>
        </div>
      </div>

      {/* Semáforo de calidad del despacho */}
      <div
        className={`rounded-2xl border-2 p-4 mb-4 flex items-center justify-between gap-3 flex-wrap ${sem.cls}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{sem.emoji}</span>
          <div>
            <p className="font-black text-lg tracking-tight">{sem.label}</p>
            <p className="text-xs opacity-80 font-bold">
              {finalizada
                ? tarea.disposicion
                  ? `Disposición: ${tarea.disposicion}`
                  : `Folio ${tarea.folio || '—'}`
                : faltan > 0
                  ? `${faltan} ítem(s) del checklist por responder`
                  : 'Checklist completo — listo para finalizar'}
            </p>
          </div>
        </div>
        {resPeso && (
          <span
            className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${resPeso === 'CONFORME' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`}
          >
            Peso {resPeso}
          </span>
        )}
      </div>

      {/* SKUs del despacho (si se cargaron al crear) */}
      {Array.isArray(ctx.skus) && ctx.skus.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
          <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
            <Package size={16} className="text-slate-400" /> SKUs del despacho ({ctx.skus.length})
          </h3>
          <div className="space-y-1.5">
            {ctx.skus.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 text-sm border-b border-slate-50 last:border-0 py-1.5"
              >
                <span className="min-w-0">
                  <b className="text-slate-800">{s.codigo_producto}</b>{' '}
                  <span className="text-slate-500">· {s.producto}</span>
                </span>
                <span className="text-xs text-slate-400 shrink-0">
                  {s.ubicacion || '—'} · {s.cantidad} {s.unidad_medida || ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Firma electrónica */}
      {tarea.firma_digital ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <BadgeCheck size={22} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-sm min-w-0">
            <p className="font-black text-emerald-800">Firmado digitalmente</p>
            <p className="text-emerald-700 text-xs">
              {tarea.firmado_nombre || '—'} ·{' '}
              {tarea.firmado_en ? new Date(tarea.firmado_en).toLocaleString('es-CL') : ''} ·{' '}
              {tarea.firma_algoritmo}
            </p>
          </div>
        </div>
      ) : finalizada && canManage ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600 flex items-center gap-2">
            <PenLine size={18} className="text-slate-400" /> Documento sin firmar.
          </div>
          <button
            onClick={firmarDoc}
            disabled={firmar.isPending}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50"
          >
            <PenLine size={16} /> Firmar digitalmente
          </button>
        </div>
      ) : null}

      {/* Niveles */}
      <div className="space-y-4">
        {CHECKLIST_SALIDA_NIVELES.map((nivel) => (
          <div key={nivel.nivel} className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-black text-slate-800 mb-3">{nivel.titulo}</h3>
            <div className="space-y-2.5">
              {nivel.params.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start gap-3 py-1.5 border-b border-slate-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-semibold">{p.label}</p>
                    {answers[p.id]?.estado && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          Evidencia:
                        </span>
                        <select
                          value={answers[p.id]?.evidencia || ''}
                          disabled={readOnly}
                          onChange={(e) => setEvid(p.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-bold ${answers[p.id]?.evidencia ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700' : 'border-slate-200 text-slate-400'}`}
                        >
                          <option value="">— cómo se verificó —</option>
                          {EVIDENCIA_OPCIONES.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {answers[p.id]?.estado === 'NO' && (
                      <input
                        value={answers[p.id]?.nota || ''}
                        disabled={readOnly}
                        onChange={(e) => setNota(p.id, e.target.value)}
                        placeholder="Detalle de la no conformidad…"
                        className="mt-1.5 w-full px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/40 text-xs outline-none focus:border-rose-400"
                      />
                    )}
                    {answers[p.id]?.estado === 'NA' && (
                      <input
                        value={answers[p.id]?.nota || ''}
                        disabled={readOnly}
                        onChange={(e) => setNota(p.id, e.target.value)}
                        placeholder="Justificación del N/A (recomendada para auditoría)…"
                        className="mt-1.5 w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs outline-none focus:border-slate-400"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RespBtn
                      pid={p.id}
                      val="OK"
                      icon={<Check size={16} />}
                      activeCls="bg-emerald-500 border-emerald-500 text-white"
                    />
                    <RespBtn
                      pid={p.id}
                      val="NO"
                      icon={<X size={16} />}
                      activeCls="bg-rose-500 border-rose-500 text-white"
                    />
                    <RespBtn
                      pid={p.id}
                      val="NA"
                      icon={<Minus size={16} />}
                      activeCls="bg-slate-400 border-slate-400 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Control de peso */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
            <Scale size={16} className="text-slate-400" /> Control de peso
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Peso esperado (kg)
              </label>
              <input
                value={pesos.esperado || ''}
                disabled={readOnly}
                inputMode="decimal"
                onChange={(e) =>
                  setEx('pesos', { ...pesos, esperado: e.target.value.replace(/[^0-9.,]/g, '') })
                }
                placeholder="Ej. 125"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Peso registrado (kg)
              </label>
              <input
                value={pesos.registrado || ''}
                disabled={readOnly}
                inputMode="decimal"
                onChange={(e) =>
                  setEx('pesos', { ...pesos, registrado: e.target.value.replace(/[^0-9.,]/g, '') })
                }
                placeholder="Ej. 125,3"
                className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-emerald-400"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              {resPeso ? (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-black ${resPeso === 'CONFORME' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`}
                >
                  {resPeso === 'CONFORME' ? <Check size={15} /> : <AlertTriangle size={15} />}{' '}
                  {resPeso}
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-bold">
                  Ingresa ambos pesos (tolerancia ±2%). Si falta una caja, el peso cambia.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bultos: etiqueta por bulto */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Boxes size={16} className="text-slate-400" /> Bultos y etiquetas
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Total bultos
              </label>
              <input
                value={extras.bultosTotal ?? tarea.bultos ?? ''}
                disabled={readOnly}
                inputMode="numeric"
                onChange={(e) => setEx('bultosTotal', e.target.value.replace(/[^0-9]/g, ''))}
                className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-black text-center outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          {bultosTotal > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: Math.min(bultosTotal, 60) }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={readOnly}
                    onClick={() => toggleEtiqueta(i)}
                    className={`px-3 py-2 rounded-xl border text-xs font-black transition-colors ${etiquetas[i] ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'}`}
                  >
                    Bulto {i + 1}/{bultosTotal} · {etiquetas[i] ? 'Etiqueta OK' : 'Pendiente'}
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold mt-2 text-slate-500">
                {etiquetas.slice(0, bultosTotal).filter(Boolean).length}/{bultosTotal} etiquetas
                verificadas
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-400">
              Define el total de bultos para verificar la etiqueta de cada uno.
            </p>
          )}
        </div>

        {/* Riesgos evaluados */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-slate-400" /> Riesgos evaluados
          </h3>
          <div className="flex flex-wrap gap-2">
            {RIESGOS_SALIDA.map((r) => {
              const on = (extras.riesgos || []).includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  disabled={readOnly}
                  onClick={() => toggleRiesgo(r.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-black transition-colors ${on ? (r.id === 'NINGUNO' ? 'bg-slate-700 border-slate-700 text-white' : 'bg-amber-500 border-amber-500 text-white') : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'}`}
                >
                  {on ? '☑' : '☐'} {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Evidencia fotográfica */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
            <Camera size={16} className="text-slate-400" /> Evidencia fotográfica
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {EVIDENCIAS_SALIDA_TIPOS.map((t) => {
              const fotos = evidencias.filter((ev) => ev.tipo === t.id);
              return (
                <div key={t.id} className="rounded-xl border border-slate-100 p-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    📷 {t.label} ({fotos.length})
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {fotos.map((ev) => (
                      <div
                        key={ev.path}
                        className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0"
                      >
                        <a href={fotoUrls[ev.path] || '#'} target="_blank" rel="noreferrer">
                          <img
                            src={fotoUrls[ev.path] || ''}
                            alt={t.label}
                            className="w-full h-full object-cover"
                          />
                        </a>
                        {!readOnly && (
                          <button
                            onClick={() => borrarFoto(ev)}
                            title="Eliminar foto"
                            className="absolute top-0.5 right-0.5 p-1 rounded-md bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    ))}
                    {!readOnly && puedeCamara && (
                      <button
                        type="button"
                        onClick={() => pedirFoto(t.id, 'camara')}
                        disabled={subiendoFoto}
                        title="Tomar foto con la cámara"
                        className="w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-emerald-300 text-emerald-500 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-40"
                      >
                        {subiendoFoto && tipoFoto === t.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Camera size={16} />
                        )}
                        <span className="text-[8px] font-black uppercase">Cámara</span>
                      </button>
                    )}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => pedirFoto(t.id, 'galeria')}
                        disabled={subiendoFoto}
                        title="Subir foto desde archivos/galería"
                        className="w-16 h-16 shrink-0 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center gap-0.5 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-40"
                      >
                        {subiendoFoto && tipoFoto === t.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <ImagePlus size={16} />
                        )}
                        <span className="text-[8px] font-black uppercase">
                          {puedeCamara ? 'Galería' : 'Foto'}
                        </span>
                      </button>
                    )}
                    {fotos.length === 0 && readOnly && (
                      <span className="text-xs text-slate-300">Sin fotos</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Galería/archivos: sin capture → elegir y varias. */}
          <input
            ref={fotoRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onFotos}
            className="hidden"
          />
          {camOpen && (
            <CameraCapture
              onCapture={(file) => onFotos({ target: { files: [file], value: '' } })}
              onClose={() => setCamOpen(false)}
            />
          )}
          <p className="text-[10px] text-slate-400 mt-2">
            Las fotos quedan asociadas al certificado (bucket privado) y se incrustan en el PDF.
          </p>
        </div>

        {/* Disposición si hay No Conformes */}
        {(hasNo || disp) && (
          <div
            className={`rounded-2xl border p-5 ${hasNo ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'}`}
          >
            <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-rose-500">
              Disposición / Acción a tomar {hasNo && <span>*obligatoria</span>}
            </label>
            <select
              value={disp}
              disabled={readOnly}
              onChange={(e) => setDisp(e.target.value)}
              className="mt-1.5 w-full px-3 py-2 rounded-xl border border-rose-200 text-sm font-bold outline-none focus:border-rose-400 bg-white"
            >
              <option value="">— Seleccionar disposición —</option>
              {DISPOSICIONES_SALIDA.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Observaciones */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Observaciones generales
          </label>
          <textarea
            value={obs}
            disabled={readOnly}
            onChange={(e) => setObs(e.target.value)}
            rows={2}
            placeholder="Notas de la certificación de salida…"
            className="mt-1.5 w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-400 resize-none"
          />
        </div>
      </div>

      {!readOnly && (
        <div className="sticky bottom-3 mt-5 bg-white rounded-2xl border border-slate-200 shadow-lg p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-black">
            {faltan > 0 ? (
              <span className="text-slate-500">{faltan} ítem(s) por responder</span>
            ) : hasNo ? (
              <span className="text-rose-600">Resultado automático: NO CONFORME</span>
            ) : (
              <span className="text-emerald-600">Resultado automático: CONFORME</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={guardarAvance}
              disabled={guardar.isPending}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50"
            >
              Guardar avance
            </button>
            <button
              onClick={finalizar}
              disabled={guardar.isPending || faltan > 0}
              className={`px-4 py-2.5 rounded-xl text-white font-black text-sm flex items-center gap-2 disabled:opacity-40 ${hasNo ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {hasNo ? (
                <>
                  <Ban size={16} /> Finalizar (No Conforme)
                </>
              ) : (
                <>
                  <ShieldCheck size={16} /> Certificar salida
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {tarea.estado === 'NO_CONFORME' && (
        <div className="mt-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle size={16} /> Salida <b>NO CONFORME</b>. No despachar hasta resolver.
          {tarea.disposicion ? ` Disposición: ${tarea.disposicion}.` : ''}
        </div>
      )}
    </div>
  );
};

// ── Cola del hito 3 ─────────────────────────────────────────────────────────
const SalidaCertificacion = () => {
  const { hasPermission, user } = useAuth();
  const canManage = hasPermission('manage_quality') || hasPermission('manage_monitoreo');
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const { data: tareas = [], isLoading, refetch, isFetching } = useTareasSalida();
  const eliminar = useEliminarTareaCalidad();
  const [sel, setSel] = useState(null);
  const [modalManual, setModalManual] = useState(false); // creación manual
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  const borrar = async (t, e) => {
    e.stopPropagation();
    if (
      !confirm(
        `¿Eliminar la certificación de salida (NV ${t.oc || '—'})? Esta acción no se puede deshacer.`
      )
    )
      return;
    try {
      await eliminar.mutateAsync(t.id);
      toast.success('Certificación eliminada');
    } catch (err) {
      toast.error(`No se pudo eliminar: ${err.message}`);
    }
  };

  const pendientes = tareas.filter(
    (t) => t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO'
  ).length;
  const tareasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLocaleLowerCase('es-CL');
    return tareas.filter((t) => {
      const ctx = t.contexto || {};
      const coincideTexto =
        !q ||
        [t.oc, t.proveedor, t.folio, ctx.cliente, ctx.guia, ctx.transportista].some((v) =>
          String(v || '')
            .toLocaleLowerCase('es-CL')
            .includes(q)
        );
      return coincideTexto && (filtroEstado === 'TODOS' || t.estado === filtroEstado);
    });
  }, [busqueda, filtroEstado, tareas]);

  const selFresh = sel ? tareas.find((t) => t.id === sel) || null : null;
  if (selFresh)
    return <SalidaForm tarea={selFresh} onBack={() => setSel(null)} canManage={canManage} />;

  return (
    <div>
      <div className="mb-4 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-teal-600">
              Hito 3 · Salida
            </p>
            <h2 className="mt-0.5 text-lg font-black text-slate-900">
              Certificación antes de despacho
            </h2>
            <p className="text-xs text-slate-500">
              Busca por N.V., OC, cliente, proveedor, guía o folio.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Actualizar
            </button>
            {canManage && (
              <button
                onClick={() => setModalManual(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-emerald-700"
              >
                <PencilLine size={14} /> Certificar salida (N.V. + SKU)
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <SalidaMetric label="Total" value={tareas.length} tone="slate" />
          <SalidaMetric label="Por certificar" value={pendientes} tone="amber" />
          <SalidaMetric label="Emitidas" value={tareas.length - pendientes} tone="emerald" />
        </div>
        <div className="mt-4 flex flex-col lg:flex-row gap-2">
          <label className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar N.V., OC, proveedor, cliente o folio…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
            />
          </label>
          <div className="flex gap-1 overflow-x-auto pb-0.5">
            {['TODOS', 'PENDIENTE', 'EN_PROCESO', 'CONFORME', 'NO_CONFORME'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-black tracking-wide transition ${filtroEstado === estado ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-200'}`}
              >
                {estado === 'TODOS' ? 'Todos' : ESTADO_TAREA_META[estado]?.label || estado}
              </button>
            ))}
          </div>
        </div>
        {!isLoading && (
          <p className="mt-2 text-[11px] font-bold text-slate-400">
            Mostrando {tareasFiltradas.length} de {tareas.length} certificaciones.
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-500" size={36} />
        </div>
      ) : tareas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Truck size={44} className="text-slate-200 mb-4" />
          <h3 className="text-base font-bold text-slate-400">Sin certificaciones de salida</h3>
          <p className="text-xs text-slate-300">
            Usa “Certificar manual” (escribes la N.V. y agregas los SKUs) o “Desde despacho” para
            elegir uno existente.
          </p>
        </div>
      ) : tareasFiltradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
          <Search size={34} className="mx-auto mb-3 text-slate-300" />
          <h3 className="font-bold text-slate-500">No hay certificaciones que coincidan</h3>
          <button
            onClick={() => {
              setBusqueda('');
              setFiltroEstado('TODOS');
            }}
            className="mt-2 text-xs font-black text-teal-600 hover:text-teal-700"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tareasFiltradas.map((t) => {
            const meta = ESTADO_TAREA_META[t.estado] || {};
            const ctx = t.contexto || {};
            const pend = t.estado === 'PENDIENTE' || t.estado === 'EN_PROCESO';
            return (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => setSel(t.id)}
                className={`cursor-pointer text-left bg-white rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${pend ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-emerald-300'}`}
              >
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="flex items-center gap-1.5 font-black text-slate-900 truncate">
                    <Package size={16} className="text-slate-400 shrink-0" />
                    {t.proveedor || ctx.cliente || 'Sin cliente'}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${meta.cls}`}
                    >
                      {meta.label || t.estado}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={(e) => borrar(t, e)}
                        title="Eliminar (admin)"
                        className="p-1.5 rounded-lg text-slate-300 hover:bg-rose-100 hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-teal-50 text-teal-700 border-teal-200">
                    NV {t.oc || ctx.nv || '—'}
                  </span>
                  {t.folio && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-600 border-emerald-200 font-mono">
                      {t.folio}
                    </span>
                  )}
                  {(t.estado === 'CONFORME' || t.estado === 'NO_CONFORME') &&
                    (() => {
                      const s = semaforoSalida(t);
                      return (
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${s.cls}`}
                        >
                          {s.emoji} {s.label}
                        </span>
                      );
                    })()}
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Guía {ctx.guia || '—'} · {t.fecha_recepcion || '—'}
                </p>
                {t.bultos != null && (
                  <p className="text-xs text-slate-400 mt-1">
                    {t.bultos} bultos ·{' '}
                    {ctx.transportista || ctx.empresa_transporte || 's/transportista'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalManual && (
        <ManualModal
          onClose={() => setModalManual(false)}
          onCreated={(id) => {
            setModalManual(false);
            if (id) setSel(id);
          }}
        />
      )}
    </div>
  );
};

const SalidaMetric = ({ label, value, tone }) => {
  const tones = {
    slate: 'bg-white text-slate-800 border-slate-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };
  return (
    <div className={`rounded-xl border px-3 py-2 ${tones[tone] || tones.slate}`}>
      <p className="text-lg font-black leading-none">{value}</p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-widest opacity-70">{label}</p>
    </div>
  );
};

export default SalidaCertificacion;
