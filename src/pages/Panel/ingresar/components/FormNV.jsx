import { useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  FileSearch,
  Link2,
  MapPinned,
  Search,
  Sparkles,
  Truck
} from 'lucide-react';
import { useFormNVStore } from '../store/useFormNVStore';
import {
  ESTADOS,
  SHIPPING_SUBESTADOS,
  estadosDisponibles,
  estampaDespacho,
  siguienteEstadoPermitido
} from '../estados';
import PillNavCanal from './PillNavCanal';
import PillNavEstado from './PillNavEstado';
import {
  CANALES,
  VARIOS_TIPOS,
  colorFor,
  ACCENT,
  INCIDENCIAS_NV,
  ESTADOS_INCIDENCIA
} from '../ingresarService';

/**
 * Formulario "Ingresar NV" — presentacional. Lee/escribe TODO su estado desde
 * useFormNVStore (sin prop-drilling). La página solo le pasa opciones de catálogo
 * y el callback de lookup; el guardado (handleSubmit) lo dispara la barra inferior.
 */
export default function FormNV({
  options,
  transportistasOpts,
  vendedoresMaestro,
  onLookup,
  onLookupOrange,
  canRequestReopen,
  onOpenReopen,
  latestReopenRequest
}) {
  const s = useFormNVStore();
  const {
    canal,
    nv,
    lookupResult,
    lookupLoading,
    mode,
    estado,
    shippingSubestado,
    shippingPausaMotivo,
    tipoDespacho,
    transportista,
    fechaCompromiso,
    fechaAprobacion,
    fechaAprobacionReal,
    fechaFacturacion,
    fechaDespacho,
    factura,
    guia,
    bultos,
    valorFactura,
    numeroEnvio,
    urgente,
    variosTipo,
    variosCliente,
    variosVendedor,
    variosDivision,
    variosCcosto,
    orangeAssociationRequired,
    orangeAssociationNv,
    orangeAssociationData,
    orangeAssociationLoading,
    orangeAssociationError,
    incidencia,
    estadoIncidencia,
    observacionesIncidencia,
    errors,
    submitResult,
    autoFilledDates,
    patch,
    markAutoFilled,
    clearAutoFilled,
    recalcCompromiso
  } = s;

  // Auto-rellenar fechas según el estado elegido. Shipping estampa facturación;
  // los estados de despacho estampan despacho + facturación. La pertenencia se
  // decide con helpers de estados.js (sin arrays en MAYÚSCULAS hardcodeados).
  useEffect(() => {
    if (mode === 'idle') return;
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
    const despacha = estampaDespacho(estado);
    const esShipping = estado.toUpperCase() === ESTADOS.SHIPPING.toUpperCase();
    const patchObj = {};
    const added = [];
    if (despacha && !fechaDespacho) {
      patchObj.fechaDespacho = hoy;
      added.push('fechaDespacho');
    }
    if ((esShipping || despacha) && !fechaFacturacion) {
      patchObj.fechaFacturacion = hoy;
      added.push('fechaFacturacion');
    }
    if (added.length > 0) {
      patch(patchObj);
      markAutoFilled(added);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, mode]);

  // Auto-calcular fecha compromiso cuando cambia la fecha de aprobación real.
  useEffect(() => {
    if (mode === 'idle') return;
    recalcCompromiso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaAprobacionReal, mode]);

  // Mapa nombre→vendedor (case-insensitive) para auto-rellenar ccosto/división.
  const vendedorPorNombre = useMemo(() => {
    const m = new Map();
    vendedoresMaestro.forEach((v) => m.set(v.nombre.trim().toLowerCase(), v));
    return m;
  }, [vendedoresMaestro]);

  // Al elegir un vendedor del catálogo, auto-rellenar división + centro de costo
  // (editable: el operador puede sobrescribir después).
  const onVendedorChange = (nombre) => {
    const match = vendedorPorNombre.get(nombre.trim().toLowerCase());
    if (match) {
      patch({
        variosVendedor: nombre,
        variosDivision: match.division || '',
        variosCcosto: match.centro_costo || ''
      });
    } else {
      patch({ variosVendedor: nombre });
    }
  };

  const canalColor = CANALES.find((item) => item.value === canal)?.color || ACCENT;

  const canalMeta = {
    ptm: {
      eyebrow: 'Canal principal',
      title: 'PTM',
      hint: 'Flujo estándar para notas de venta institucionales de PTM.',
      tone: 'from-orange-500/10 to-amber-500/10 border-orange-200',
      badge: 'Operación base',
      color: '#ea580c'
    },
    orange: {
      eyebrow: 'Canal asociado',
      title: 'Orange',
      hint: 'Mantiene lookup y registro dedicado para el canal Orange.',
      tone: 'from-amber-500/10 to-yellow-500/10 border-amber-200',
      badge: 'Canal externo',
      color: '#f59e0b'
    },
    farmapack: {
      eyebrow: 'Canal asociado',
      title: 'Farmapack',
      hint: 'Pensado para seguimiento limpio de notas Farmapack sin mezclar numeración.',
      tone: 'from-emerald-500/10 to-teal-500/10 border-emerald-200',
      badge: 'Canal externo',
      color: '#0f766e'
    },
    varios: {
      eyebrow: 'Canal flexible',
      title: 'Varios',
      hint: 'Permite captura manual para casos especiales, demos y salidas no estándar.',
      tone: 'from-slate-500/10 to-indigo-500/10 border-slate-200',
      badge: 'Manual asistido',
      color: '#4f46e5'
    }
  }[canal] || {
    eyebrow: 'Canal',
    title: 'Operación',
    hint: 'Selecciona un canal para comenzar.',
    tone: 'from-slate-500/10 to-slate-500/10 border-slate-200',
    badge: 'Selección',
    color: ACCENT
  };

  const lookupBadge = lookupResult
    ? lookupResult.found
      ? {
          container: 'bg-blue-50 text-blue-700 border-blue-200',
          iconWrap: 'bg-blue-100 text-blue-700',
          title: 'NV encontrada',
          description: `Fila ${lookupResult.row} lista para actualizar en el panel.`
        }
      : {
          container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          iconWrap: 'bg-emerald-100 text-emerald-700',
          title: 'NV nueva',
          description: 'No existe una coincidencia previa; el flujo continúa como creación.'
        }
    : null;
  const nvEntregada = lookupResult?.found && lookupResult?.data?.estado === 'Entregado';
  const estadoOriginal = lookupResult?.data?.estado || ESTADOS.EN_PROCESO;
  const pausaActiva = Boolean(lookupResult?.data?.shipping_subestado);
  const estadosHabilitados = estadosDisponibles(estadoOriginal, {
    nuevo: mode === 'create',
    pausada: pausaActiva
  });
  const siguienteEstado = siguienteEstadoPermitido(estadoOriginal);

  return (
    <div className="anim-fade-up space-y-4">
      {/* Identificación */}
      <section className="relative overflow-hidden bg-white rounded-[1.75rem] border border-slate-200/90 p-5 sm:p-6 shadow-[0_22px_70px_-45px_rgba(15,23,42,0.32)]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_22%)]" />

        <div className="relative grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_290px] gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{
                    border: `1px solid ${canalColor}33`,
                    background: `${canalColor}12`,
                    color: canalColor
                  }}
                >
                  <Sparkles size={12} />
                  Identificación
                </div>
                <h2 className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Ingresar nota de venta
                </h2>
                <p className="mt-1 text-sm text-slate-500 max-w-2xl">
                  Selecciona el canal, consulta la N.V. y continúa con el flujo correcto sin cambiar
                  de pantalla.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${mode === 'idle' ? 'bg-slate-300' : lookupResult?.found ? 'bg-blue-500' : 'bg-emerald-500'}`}
                />
                {mode === 'idle'
                  ? 'Pendiente de consulta'
                  : lookupResult?.found
                    ? 'Modo actualización'
                    : 'Modo creación'}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={15} className="text-slate-400" />
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em]">
                  Canal operativo
                </label>
              </div>
              <PillNavCanal
                items={CANALES}
                active={canal}
                onSelect={(value) =>
                  patch({
                    canal: value,
                    lookupResult: null,
                    mode: 'idle',
                    orangeAssociationRequired: false,
                    orangeAssociationNv: '',
                    orangeAssociationData: null,
                    orangeAssociationError: ''
                  })
                }
              />
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
              <div className="min-w-0">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.16em] mb-2 block">
                  N° Nota de venta
                </label>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={nv}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v.trim() && mode !== 'idle')
                        patch({
                          nv: v,
                          mode: 'idle',
                          lookupResult: null,
                          submitResult: null,
                          errors: []
                        });
                      else patch({ nv: v });
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && onLookup()}
                    placeholder="Ej: 97125"
                    className="w-full h-14 rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-base font-semibold text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400"
                    style={{
                      boxShadow: `0 0 0 0 rgba(0,0,0,0)`
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  La consulta detecta si la N.V. existe para actualizarla o si corresponde crear un
                  registro nuevo.
                </p>
              </div>

              <button
                type="button"
                onClick={onLookup}
                disabled={lookupLoading || !nv.trim()}
                className="h-14 min-w-[152px] px-5 rounded-2xl text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_16px_30px_-18px_rgba(24,24,27,0.8)] inline-flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${canalMeta.color} 0%, #18181b 100%)`
                }}
              >
                {lookupLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FileSearch size={16} /> Buscar N.V.
                  </>
                )}
              </button>
            </div>

            {lookupResult && (
              <div className="mt-4 anim-fade-up">
                <div className={`rounded-[1.35rem] border p-4 ${lookupBadge.container}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-10 w-10 rounded-2xl flex items-center justify-center ${lookupBadge.iconWrap}`}
                      >
                        {lookupResult.found ? <ArrowUpRight size={18} /> : <Sparkles size={18} />}
                      </div>
                      <div>
                        <div className="text-sm font-black">{lookupBadge.title}</div>
                        <div className="text-xs mt-0.5 opacity-90">{lookupBadge.description}</div>
                      </div>
                    </div>
                    <div className="rounded-full border border-current/20 bg-white/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
                      {lookupResult.found ? 'Actualizar' : 'Crear'}
                    </div>
                  </div>

                  {(() => {
                    const af = lookupResult.found ? lookupResult.data : lookupResult.autoFill;
                    if (!af) return null;
                    const cells = [
                      { l: 'Cliente', v: af.cliente },
                      { l: 'Vendedor', v: af.vendedor },
                      { l: 'C. Costo', v: af.ccosto || af.centro_costo },
                      { l: 'División', v: af.division }
                    ].filter((x) => x.v);
                    if (cells.length === 0) return null;
                    return (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {cells.map((x) => (
                          <div
                            key={x.l}
                            className="rounded-2xl border border-white/60 bg-white/70 px-3.5 py-3"
                          >
                            <div className="text-[10px] uppercase tracking-[0.16em] opacity-60 font-bold">
                              {x.l}
                            </div>
                            <div className="text-[13px] mt-1 font-semibold truncate">{x.v}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          <aside
            className={`relative rounded-[1.5rem] border bg-gradient-to-br ${canalMeta.tone} p-4 sm:p-5`}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {canalMeta.eyebrow}
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="text-2xl font-black text-slate-900">{canalMeta.title}</div>
              <div
                className="rounded-full border bg-white/80 px-3 py-1 text-[11px] font-bold"
                style={{
                  borderColor: `${canalMeta.color}33`,
                  color: canalMeta.color
                }}
              >
                {canalMeta.badge}
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{canalMeta.hint}</p>

            <div className="mt-5 rounded-2xl border border-white/70 bg-white/80 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Buenas prácticas
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="mt-1 h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                  <span>
                    Usa la N.V. exacta del canal seleccionado para evitar cruces de numeración.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    Si existe una coincidencia, el panel entra en modo actualización con los datos
                    recuperados.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-500 shrink-0" />
                  <span>
                    Si no existe, continúas directo con creación sin salir del formulario.
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {canal === 'ptm' && orangeAssociationRequired && mode !== 'idle' && (
        <section className="bg-white rounded-2xl border border-amber-200 p-5 anim-fade-up">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700 border border-amber-200">
                <Link2 size={12} />
                Asociación comercial
              </div>
              <h2 className="mt-3 text-base font-black text-slate-900">Asociar N.V. ORANGE</h2>
              <p className="mt-1 text-sm text-slate-500 max-w-3xl">
                Detectamos que esta N.V. PTM corresponde a un cliente Orange. Vincula la N.V. Orange
                para cargar automáticamente cliente, vendedor y centro de costo correctos.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-800 max-w-sm">
              Esta asociación ayuda a visibilizar errores y atrasos de despacho por vendedor dentro
              del dashboard operacional.
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
            <div>
              <label className="field-label">N.V. ORANGE asociada *</label>
              <input
                type="text"
                value={orangeAssociationNv}
                onChange={(e) =>
                  patch({
                    orangeAssociationNv: e.target.value,
                    orangeAssociationError: '',
                    orangeAssociationData: null
                  })
                }
                onKeyDown={(e) => e.key === 'Enter' && onLookupOrange?.(orangeAssociationNv)}
                className="field-input"
                placeholder="Ej: ORG-100234"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Se busca contra el catálogo Orange y se guarda vinculado en la misma operación.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onLookupOrange?.(orangeAssociationNv)}
              disabled={orangeAssociationLoading || !orangeAssociationNv.trim()}
              className="h-11 px-5 rounded-xl bg-amber-500 text-white text-sm font-bold active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm inline-flex items-center justify-center gap-2"
            >
              {orangeAssociationLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Link2 size={15} />
              )}
              Validar asociación
            </button>
          </div>

          {orangeAssociationError && (
            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle size={16} />
              {orangeAssociationError}
            </div>
          )}

          {orangeAssociationData && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {[
                { label: 'Cliente Orange', value: orangeAssociationData.cliente || '—' },
                { label: 'Vendedor', value: orangeAssociationData.vendedor || '—' },
                { label: 'Centro costo', value: orangeAssociationData.ccosto || '—' },
                { label: 'División', value: orangeAssociationData.division || '—' }
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-3"
                >
                  <div className="text-[10px] uppercase tracking-[0.16em] text-amber-700 font-bold">
                    {item.label}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-800 truncate">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {nvEntregada && (
        <section className="rounded-2xl border border-red-200 bg-red-50/80 p-5 anim-fade-up">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-red-700">
                <AlertTriangle size={12} />
                N.V. entregada bloqueada
              </div>
              <h2 className="mt-3 text-base font-black text-slate-900">
                Esta N.V. no puede editarse directo
              </h2>
              <p className="mt-1 text-sm text-slate-600 max-w-3xl">
                Para no alterar el cumplimiento OTIF/SLA, cualquier cambio debe pasar por una
                solicitud de reapertura aprobada por otro rol. Al aprobarse, la N.V. vuelve
                automáticamente a <strong>En Proceso</strong>.
              </p>
            </div>
            {canRequestReopen && (
              <button
                type="button"
                onClick={onOpenReopen}
                className="h-11 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white shadow-sm hover:bg-orange-600"
              >
                Solicitar reapertura
              </button>
            )}
          </div>

          {latestReopenRequest && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">
                Solicitud pendiente
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-800">
                {latestReopenRequest.motivo}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Solicitada por {latestReopenRequest.solicitada_por_nombre || 'Usuario'} el{' '}
                {String(latestReopenRequest.solicitada_at || '').slice(0, 10) || '—'}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Tipo + datos manuales para canal Varios */}
      {canal === 'varios' && mode === 'create' && (
        <section className="bg-white rounded-2xl border border-orange-200 p-5 anim-fade-up">
          <h2 className="text-[11px] font-semibold text-orange-500 uppercase tracking-wider mb-4">
            {variosTipo || 'Varios'} — Datos Manuales
          </h2>
          {/* Selector de tipo */}
          <div className="mb-4">
            <label className="field-label">Tipo *</label>
            <div className="flex flex-wrap gap-2">
              {VARIOS_TIPOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => patch({ variosTipo: t })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${variosTipo === t ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="field-label">Nombre del Cliente *</label>
              <input
                type="text"
                value={variosCliente}
                onChange={(e) => patch({ variosCliente: e.target.value })}
                className="field-input"
                placeholder="Ej: Hospital Regional"
              />
            </div>
            <div>
              <label className="field-label">Vendedor *</label>
              {vendedoresMaestro.length > 0 ? (
                <>
                  <input
                    type="text"
                    list="vendedores-list"
                    value={variosVendedor}
                    onChange={(e) => onVendedorChange(e.target.value)}
                    className="field-input"
                    placeholder="Selecciona o escribe"
                  />
                  <datalist id="vendedores-list">
                    {vendedoresMaestro.map((v) => (
                      <option key={v.id} value={v.nombre} />
                    ))}
                  </datalist>
                </>
              ) : (
                <input
                  type="text"
                  value={variosVendedor}
                  onChange={(e) => patch({ variosVendedor: e.target.value })}
                  className="field-input"
                  placeholder="Nombre del vendedor"
                />
              )}
            </div>
            <div>
              <label className="field-label">
                División <span className="text-gray-400 font-normal">(auto)</span>
              </label>
              <input
                type="text"
                value={variosDivision}
                onChange={(e) => patch({ variosDivision: e.target.value })}
                className="field-input"
                placeholder="Ej: DIV. INSTITUCIONAL"
              />
            </div>
            <div>
              <label className="field-label">
                Centro Costo <span className="text-gray-400 font-normal">(auto)</span>
              </label>
              <input
                type="text"
                value={variosCcosto}
                onChange={(e) => patch({ variosCcosto: e.target.value })}
                className="field-input"
                placeholder="Ej: 1-06"
              />
            </div>
            <div>
              <label className="field-label">F. Aprobación Real</label>
              <input
                type="date"
                value={fechaAprobacionReal}
                onChange={(e) => patch({ fechaAprobacionReal: e.target.value })}
                className="field-input"
              />
            </div>
          </div>
        </section>
      )}

      {/* Logística */}
      {mode !== 'idle' && (
        <>
          <section className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Logística
            </h2>
            <label className="field-label">Estado *</label>
            <div className="mb-5">
              <PillNavEstado
                items={estadosHabilitados.map((e) => ({ value: e, label: e, color: colorFor(e) }))}
                active={estado}
                onSelect={(value) => patch({ estado: value })}
              />
            </div>
            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              {mode === 'create'
                ? 'Toda N.V. nueva comienza en En Proceso.'
                : pausaActiva
                  ? 'La N.V. está pausada en Shipping. Debes reactivarla antes de avanzar.'
                  : siguienteEstado
                    ? `Flujo bloqueado: el único avance permitido es ${estadoOriginal} → ${siguienteEstado}.`
                    : 'Estado final: cualquier reapertura requiere autorización.'}
            </div>

            {estado === ESTADOS.SHIPPING && (
              <div className="mb-5 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
                <div className="flex flex-col gap-1 mb-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-violet-700">
                    Situación especial en Shipping
                  </span>
                  <span className="text-xs text-slate-600">
                    Estas opciones pausan el reloj SLA si la N.V. todavía estaba dentro de plazo. No
                    cambian el estado principal.
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => patch({ shippingSubestado: '', shippingPausaMotivo: '' })}
                    className={`rounded-xl border px-3 py-3 text-xs font-bold ${!shippingSubestado ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-slate-600'}`}
                  >
                    Activa para despacho
                  </button>
                  {SHIPPING_SUBESTADOS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => patch({ shippingSubestado: item.value })}
                      className={`rounded-xl border px-3 py-3 text-xs font-bold ${shippingSubestado === item.value ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                {shippingSubestado && (
                  <div className="mt-3">
                    <label className="field-label">Motivo obligatorio</label>
                    <textarea
                      value={shippingPausaMotivo}
                      onChange={(e) => patch({ shippingPausaMotivo: e.target.value })}
                      className="field-input min-h-[76px] resize-y"
                      placeholder="Indica por qué queda rezagada y quién debe resolverlo..."
                    />
                  </div>
                )}
              </div>
            )}

            {/* Campo URGENTE destacado */}
            <button
              type="button"
              onClick={() => patch({ urgente: !urgente })}
              className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 mb-3.5 border-2 transition-all ${urgente ? 'bg-red-50 border-red-400 shadow-sm shadow-red-200' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`text-xl transition-transform ${urgente ? 'scale-110' : 'opacity-40 grayscale'}`}
                >
                  🚨
                </span>
                <span className="flex flex-col items-start">
                  <span
                    className={`text-sm font-bold ${urgente ? 'text-red-600' : 'text-gray-700'}`}
                  >
                    NV Urgente
                  </span>
                  <span className="text-[11px] text-gray-400">Se destaca en el panel TV</span>
                </span>
              </span>
              <span
                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${urgente ? 'bg-red-500' : 'bg-gray-300'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${urgente ? 'translate-x-6' : ''}`}
                />
              </span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="field-label">Tipo Despacho</label>
                <select
                  value={tipoDespacho}
                  onChange={(e) => patch({ tipoDespacho: e.target.value })}
                  className="field-input"
                >
                  <option value="">— Seleccionar —</option>
                  {(
                    options?.tiposDespacho || [
                      'Courier - Inyección',
                      'Directo',
                      'Courier (Retiro / Pick-up)'
                    ]
                  ).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Transportista</label>
                {transportistasOpts.length > 0 ? (
                  <select
                    value={transportista}
                    onChange={(e) => patch({ transportista: e.target.value })}
                    className="field-input"
                  >
                    <option value="">— Seleccionar —</option>
                    {(transportista && !transportistasOpts.includes(transportista)
                      ? [transportista, ...transportistasOpts]
                      : transportistasOpts
                    ).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={transportista}
                    onChange={(e) => patch({ transportista: e.target.value })}
                    placeholder="Nombre transportista"
                    className="field-input"
                  />
                )}
              </div>
              {mode === 'update' && (
                <div>
                  <label className="field-label">
                    Fecha Compromiso{' '}
                    {autoFilledDates.has('fechaCompromiso') ? (
                      <span className="ml-1 normal-case" style={{ color: ACCENT }}>
                        (auto — 2 días hábiles)
                      </span>
                    ) : (
                      <span className="ml-1 normal-case text-gray-400">(auto)</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={fechaCompromiso}
                    readOnly
                    className="field-input bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              )}
              <div>
                <label className="field-label">Fecha de Creación de N.V</label>
                <input
                  type="date"
                  value={fechaAprobacion}
                  readOnly
                  className="field-input bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="field-label">Fecha Aprobación Real</label>
                <input
                  type="date"
                  value={fechaAprobacionReal}
                  onChange={(e) => patch({ fechaAprobacionReal: e.target.value })}
                  className="field-input"
                />
                <p className="mt-1 text-[10px] leading-tight text-gray-400">
                  Fecha en que realmente se aprobó la NV. Corrige el cálculo de Fecha Compromiso si
                  hubo demora.
                </p>
              </div>
              <div>
                <label className="field-label">
                  Fecha Facturación{' '}
                  {autoFilledDates.has('fechaFacturacion') && (
                    <span className="ml-1 normal-case" style={{ color: ACCENT }}>
                      (auto)
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  value={fechaFacturacion}
                  onChange={(e) => {
                    patch({ fechaFacturacion: e.target.value });
                    clearAutoFilled('fechaFacturacion');
                  }}
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">
                  Fecha Despacho{' '}
                  {autoFilledDates.has('fechaDespacho') && (
                    <span className="ml-1 normal-case" style={{ color: ACCENT }}>
                      (auto)
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  value={fechaDespacho}
                  onChange={(e) => {
                    patch({ fechaDespacho: e.target.value });
                    clearAutoFilled('fechaDespacho');
                  }}
                  className="field-input"
                />
              </div>
            </div>
          </section>

          <details className="group bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none">
              <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Datos adicionales
              </h2>
              <span className="text-gray-300 text-xs transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="field-label">Facturas</label>
                <input
                  type="text"
                  value={factura}
                  onChange={(e) => patch({ factura: e.target.value })}
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Guía</label>
                <input
                  type="text"
                  value={guia}
                  onChange={(e) => patch({ guia: e.target.value })}
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Bultos</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={bultos}
                  onChange={(e) => patch({ bultos: e.target.value })}
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Valor Factura</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={valorFactura}
                    onChange={(e) =>
                      patch({ valorFactura: e.target.value.replace(/[^0-9.]/g, '') })
                    }
                    className="field-input pl-7"
                  />
                </div>
              </div>
              <div>
                <label className="field-label">N° de Envío</label>
                <input
                  type="text"
                  value={numeroEnvio}
                  onChange={(e) => patch({ numeroEnvio: e.target.value })}
                  className="field-input"
                />
              </div>
            </div>
          </details>

          {mode === 'update' && (
            <section className="bg-white rounded-2xl border border-gray-200 p-5 anim-fade-up">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Reporte de errores / incidencias
                  </h2>
                  <p className="mt-2 text-sm text-slate-500 max-w-3xl">
                    Reporta incidencias logísticas de la N.V. para alimentar el dashboard de errores
                    por vendedor y detectar riesgo de cumplimiento sobre 48 horas.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 max-w-sm">
                  Se consolida junto con la operación y después aparece en el tablero operacional
                  como incidencia activa.
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {INCIDENCIAS_NV.map((tipo) => {
                  const active = incidencia === tipo;
                  const Icon =
                    tipo === 'PROBLEMAS DE DIRECCIÓN'
                      ? MapPinned
                      : tipo === 'PROBLEMAS DE TRANSPORTE'
                        ? Truck
                        : AlertTriangle;
                  return (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() =>
                        patch({
                          incidencia: active ? '' : tipo,
                          estadoIncidencia: active ? 'ABIERTA' : estadoIncidencia || 'ABIERTA'
                        })
                      }
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${
                        active
                          ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <Icon size={14} />
                      {tipo}
                    </button>
                  );
                })}
              </div>

              {incidencia && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 anim-fade-up">
                  <div>
                    <label className="field-label">Estado incidencia</label>
                    <select
                      value={estadoIncidencia}
                      onChange={(e) => patch({ estadoIncidencia: e.target.value })}
                      className="field-input"
                    >
                      {ESTADOS_INCIDENCIA.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Tipo detectado</label>
                    <input
                      type="text"
                      value={incidencia}
                      readOnly
                      className="field-input bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="field-label">Observaciones</label>
                    <textarea
                      value={observacionesIncidencia}
                      onChange={(e) => patch({ observacionesIncidencia: e.target.value })}
                      className="field-input min-h-[96px] resize-y"
                      placeholder="Ej: dirección incompleta, contacto sin respuesta, transportista reprogramado, rechazo por zona..."
                    />
                  </div>
                </div>
              )}
            </section>
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 anim-fade-up">
              {errors.map((e, i) => (
                <p key={i} className="text-[13px] text-red-600 flex items-center gap-1.5">
                  <span>⚠</span>
                  {e}
                </p>
              ))}
            </div>
          )}
          {submitResult && !submitResult.success && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 anim-fade-up">
              <p className="text-[13px] text-red-600 flex items-center gap-1.5">
                <span>⚠</span>
                {submitResult.message}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
