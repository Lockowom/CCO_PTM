import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  Calculator,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Pencil,
  MapPin,
  Plus,
  RefreshCw,
  Ruler,
  Save,
  Scale,
  Truck,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { routeCoordinationService } from './routeCoordinationService';
import {
  calculateGroupVolume,
  summarizeSelectedLoads,
  validateCubicageGroups
} from './routeCapacity';

const EMPTY_GROUP = { cantidad: 1, largo_cm: '', ancho_cm: '', alto_cm: '' };
const EMPTY_VEHICLE = {
  nombre: '',
  patente: '',
  capacidad_kg: '',
  capacidad_m3: '',
  costo_fijo_por_viaje: '',
  costo_variable_por_km: '',
  costo_por_hora: '',
  velocidad_promedio_kmh: 40,
  autonomia_km: '',
  max_paradas: 12,
  ocupacion_minima_pct: 30,
  activo: true
};
const EMPTY_ORIGIN = {
  warehouse_name: '',
  origin_lat: '',
  origin_lon: '',
  return_to_origin: true
};

const number = (value, digits = 0) =>
  new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(Number(value || 0));

const money = (value) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const recommendationCopy = {
  COMPLETAR_DATOS: ['Faltan datos físicos', 'Completa peso y cubicaje antes de decidir.', 'orange'],
  SIN_ALTERNATIVAS: ['Sin alternativas configuradas', 'Registra flota o tarifa externa.', 'orange'],
  EXTERNA_SIN_COMPARACION: [
    'Solo alternativa externa',
    'No hay vehículo propio seleccionado.',
    'blue'
  ],
  EXTERNO_OBLIGATORIO: [
    'Externalizar obligatorio',
    'La carga excede peso, volumen o máximo de paradas.',
    'red'
  ],
  PROPIA_BAJA_OCUPACION: [
    'Propia con baja ocupación',
    'Cabe, pero conviene esperar y consolidar más pedidos.',
    'orange'
  ],
  PROPIA_SIN_COMPARACION: [
    'Camioneta propia disponible',
    'Cabe físicamente; falta una tarifa externa para comparar costo.',
    'green'
  ],
  CONSOLIDAR_ANTES_DE_SALIR: [
    'Consolidar antes de salir',
    'La alternativa propia es más barata, pero va bajo el mínimo de ocupación.',
    'orange'
  ],
  PROPIA_RECOMENDADA: [
    'Camioneta propia recomendada',
    'Cabe y su costo estimado es menor al externo.',
    'green'
  ],
  EXTERNA_RECOMENDADA: [
    'Transportista externo recomendado',
    'La alternativa externa tiene menor costo estimado.',
    'blue'
  ]
};

function Metric({ icon: Icon, label, value, helper }) {
  return (
    <article className="cr-cap-metric">
      <Icon size={18} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {helper && <small>{helper}</small>}
      </div>
    </article>
  );
}

export default function RouteCapacityPlanner() {
  const [catalog, setCatalog] = useState({
    shipping: [],
    flota: [],
    tarifas: [],
    decisiones_recientes: []
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [editor, setEditor] = useState(null);
  const [vehicle, setVehicle] = useState(EMPTY_VEHICLE);
  const [showVehicle, setShowVehicle] = useState(false);
  const [origin, setOrigin] = useState(EMPTY_ORIGIN);
  const [showOrigin, setShowOrigin] = useState(false);
  const [comparison, setComparison] = useState({
    flota_id: '',
    tarifa_id: '',
    distancia_km: 0
  });
  const [result, setResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, configuredOrigin] = await Promise.all([
        routeCoordinationService.capacityCatalog(),
        routeCoordinationService.configuration()
      ]);
      setCatalog({ shipping: [], flota: [], tarifas: [], decisiones_recientes: [], ...data });
      setOrigin(configuredOrigin || EMPTY_ORIGIN);
      setSelected((current) => {
        const valid = new Set((data?.shipping || []).map((item) => String(item.operacion_id)));
        return new Set([...current].filter((id) => valid.has(id)));
      });
    } catch (error) {
      toast.error(error.message || 'No se pudo cargar capacidad y flota.');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveOrigin = async (event) => {
    event.preventDefault();
    setBusy('origin');
    try {
      const saved = await routeCoordinationService.saveConfiguration(origin);
      setOrigin(saved);
      setShowOrigin(false);
      toast.success('Origen operacional verificado.');
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el origen.');
    } finally {
      setBusy('');
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  const selectedRows = useMemo(
    () => catalog.shipping.filter((row) => selected.has(String(row.operacion_id))),
    [catalog.shipping, selected]
  );
  const totals = useMemo(() => summarizeSelectedLoads(selectedRows), [selectedRows]);

  const toggle = (id) => {
    setSelected((current) => {
      const next = new Set(current);
      const key = String(id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setResult(null);
  };

  const openEditor = (row) => {
    const existing = (row.grupos || []).map((group) => ({
      cantidad: group.cantidad,
      largo_cm: group.largo_cm,
      ancho_cm: group.ancho_cm,
      alto_cm: group.alto_cm
    }));
    setEditor({
      row,
      equal: row.bultos_igual_tamano !== false,
      peso_total_kg: row.peso_total_kg || '',
      groups:
        existing.length > 0
          ? existing
          : [{ ...EMPTY_GROUP, cantidad: Math.max(1, Number(row.bultos || 1)) }]
    });
  };

  const updateGroup = (index, field, value) =>
    setEditor((current) => ({
      ...current,
      groups: current.groups.map((group, position) =>
        position === index ? { ...group, [field]: value } : group
      )
    }));

  const setEqual = (equal) =>
    setEditor((current) => ({
      ...current,
      equal,
      groups: equal
        ? [
            {
              ...(current.groups[0] || EMPTY_GROUP),
              cantidad: Math.max(1, Number(current.row.bultos || 1))
            }
          ]
        : current.groups
    }));

  const saveCubicage = async () => {
    const expected = Number(editor.row.bultos || 0);
    const validation = validateCubicageGroups(editor.groups, expected);
    if (validation.reason === 'PACKAGE_MISMATCH')
      return toast.warning(`Los grupos deben sumar exactamente ${expected} bultos.`);
    if (!validation.valid) return toast.warning('Cada dimensión debe estar entre 1 y 400 cm.');
    if (Number(editor.peso_total_kg || 0) <= 0)
      return toast.warning('Ingresa el peso total real de la N.V.');
    setBusy('cubicage');
    try {
      await routeCoordinationService.saveCubicage(
        editor.row.operacion_id,
        editor.groups.map((group) => ({
          cantidad: Number(group.cantidad),
          largo_cm: Number(group.largo_cm),
          ancho_cm: Number(group.ancho_cm),
          alto_cm: Number(group.alto_cm)
        })),
        editor.peso_total_kg
      );
      toast.success('Peso y cubicaje guardados en la N.V.');
      setEditor(null);
      setResult(null);
      await load();
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el cubicaje.');
    } finally {
      setBusy('');
    }
  };

  const saveVehicle = async (event) => {
    event.preventDefault();
    setBusy('vehicle');
    try {
      await routeCoordinationService.saveFleet(vehicle);
      toast.success('Vehículo guardado en la flota privada.');
      setVehicle(EMPTY_VEHICLE);
      setShowVehicle(false);
      await load();
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el vehículo.');
    } finally {
      setBusy('');
    }
  };

  const evaluate = async (save = false, option = 'PENDIENTE') => {
    if (selected.size === 0) return toast.warning('Selecciona al menos una N.V.');
    if (!comparison.flota_id && !comparison.tarifa_id)
      return toast.warning('Selecciona un vehículo propio o una tarifa externa.');
    setBusy(save ? `decision-${option}` : 'compare');
    try {
      const next = await routeCoordinationService.evaluateAlternatives({
        operacion_ids: [...selected].map(Number),
        flota_id: comparison.flota_id || null,
        tarifa_id: comparison.tarifa_id || null,
        distancia_km: Number(comparison.distancia_km || 0),
        guardar: save,
        opcion_elegida: option
      });
      setResult(next);
      if (save) {
        toast.success(`Decisión ${option === 'PROPIA' ? 'propia' : 'externa'} registrada.`);
        await load();
      }
    } catch (error) {
      toast.error(error.message || 'No se pudo evaluar la ruta.');
    } finally {
      setBusy('');
    }
  };

  if (loading && catalog.shipping.length === 0) {
    return (
      <div className="cr-loading">
        <RefreshCw className="cr-spin" /> Preparando capacidad, cubicaje y flota…
      </div>
    );
  }

  const recommendation = recommendationCopy[result?.recomendacion] || [
    result?.recomendacion || 'Sin evaluación',
    '',
    'slate'
  ];

  return (
    <div className="cr-capacity">
      <section className="cr-card cr-cap-header">
        <div className="cr-card__head">
          <div>
            <span className="cr-kicker">CAPACIDAD FÍSICA · PILOTO PRIVADO</span>
            <h3>Preparar carga y comparar alternativas</h3>
            <p>Selecciona N.V., completa peso/cubicaje y valida si realmente caben.</p>
          </div>
          <div className="cr-cap-actions">
            <button
              className="cr-button cr-button--soft"
              onClick={() => setShowOrigin(!showOrigin)}
            >
              <MapPin size={15} /> Origen
            </button>
            <button
              className="cr-button cr-button--soft"
              onClick={() => setShowVehicle(!showVehicle)}
            >
              <Plus size={15} /> Vehículo
            </button>
            <button className="cr-button cr-button--ghost" onClick={load} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'cr-spin' : ''} /> Actualizar
            </button>
          </div>
        </div>

        {showOrigin && (
          <form className="cr-cap-vehicle-form" onSubmit={saveOrigin}>
            <label>
              <span>Bodega/origen *</span>
              <input
                value={origin.warehouse_name || ''}
                onChange={(e) => setOrigin({ ...origin, warehouse_name: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Latitud *</span>
              <input
                type="number"
                min="-90"
                max="90"
                step="0.000001"
                value={origin.origin_lat ?? ''}
                onChange={(e) => setOrigin({ ...origin, origin_lat: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Longitud *</span>
              <input
                type="number"
                min="-180"
                max="180"
                step="0.000001"
                value={origin.origin_lon ?? ''}
                onChange={(e) => setOrigin({ ...origin, origin_lon: e.target.value })}
                required
              />
            </label>
            <label className="cr-cap-check">
              <input
                type="checkbox"
                checked={origin.return_to_origin !== false}
                onChange={(e) => setOrigin({ ...origin, return_to_origin: e.target.checked })}
              />
              <span>Regresar a origen al terminar</span>
            </label>
            <button className="cr-button cr-button--dark" disabled={busy === 'origin'}>
              <Save size={15} /> Guardar origen
            </button>
          </form>
        )}

        {showVehicle && (
          <form className="cr-cap-vehicle-form" onSubmit={saveVehicle}>
            <label>
              <span>Nombre *</span>
              <input
                value={vehicle.nombre}
                onChange={(e) => setVehicle({ ...vehicle, nombre: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Patente *</span>
              <input
                value={vehicle.patente}
                onChange={(e) => setVehicle({ ...vehicle, patente: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Capacidad kg *</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={vehicle.capacidad_kg}
                onChange={(e) => setVehicle({ ...vehicle, capacidad_kg: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Capacidad m³ *</span>
              <input
                type="number"
                min="0.01"
                step="0.0001"
                value={vehicle.capacidad_m3}
                onChange={(e) => setVehicle({ ...vehicle, capacidad_m3: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Costo fijo/viaje</span>
              <input
                type="number"
                min="0"
                value={vehicle.costo_fijo_por_viaje}
                onChange={(e) => setVehicle({ ...vehicle, costo_fijo_por_viaje: e.target.value })}
              />
            </label>
            <label>
              <span>Costo variable/km</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={vehicle.costo_variable_por_km}
                onChange={(e) => setVehicle({ ...vehicle, costo_variable_por_km: e.target.value })}
              />
            </label>
            <label>
              <span>Velocidad promedio</span>
              <input
                type="number"
                min="1"
                value={vehicle.velocidad_promedio_kmh}
                onChange={(e) => setVehicle({ ...vehicle, velocidad_promedio_kmh: e.target.value })}
              />
            </label>
            <label>
              <span>Máximo paradas</span>
              <input
                type="number"
                min="1"
                max="50"
                value={vehicle.max_paradas}
                onChange={(e) => setVehicle({ ...vehicle, max_paradas: e.target.value })}
              />
            </label>
            <label>
              <span>Costo por hora</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={vehicle.costo_por_hora}
                onChange={(e) => setVehicle({ ...vehicle, costo_por_hora: e.target.value })}
              />
            </label>
            <button className="cr-button cr-button--dark" disabled={busy === 'vehicle'}>
              <Save size={15} /> Guardar vehículo
            </button>
          </form>
        )}
      </section>

      <div className="cr-cap-summary">
        <Metric
          icon={Boxes}
          label="N.V. seleccionadas"
          value={number(totals.nvs)}
          helper={`${number(totals.bultos)} bultos`}
        />
        <Metric icon={Scale} label="Peso total" value={`${number(totals.peso, 1)} kg`} />
        <Metric icon={Ruler} label="Volumen total" value={`${number(totals.volumen, 4)} m³`} />
        <Metric
          icon={AlertTriangle}
          label="Datos incompletos"
          value={number(totals.faltan)}
          helper="peso o volumen pendiente"
        />
      </div>

      <div className="cr-cap-layout">
        <section className="cr-card">
          <div className="cr-card__head">
            <div>
              <span className="cr-kicker">N.V. EN SHIPPING</span>
              <h3>Seleccionar y preparar carga</h3>
            </div>
            <button
              className="cr-button cr-button--soft"
              onClick={() =>
                setSelected(
                  selected.size === catalog.shipping.length
                    ? new Set()
                    : new Set(catalog.shipping.map((row) => String(row.operacion_id)))
                )
              }
            >
              {selected.size === catalog.shipping.length ? 'Limpiar' : 'Seleccionar todas'}
            </button>
          </div>
          <div className="cr-cap-nv-list">
            {catalog.shipping.length === 0 && (
              <div className="cr-empty">No hay N.V. disponibles en Shipping.</div>
            )}
            {catalog.shipping.map((row) => {
              const complete =
                Number(row.peso_total_kg || 0) > 0 && Number(row.volumen_total_m3 || 0) > 0;
              return (
                <article
                  key={row.operacion_id}
                  className={`cr-cap-nv ${selected.has(String(row.operacion_id)) ? 'is-selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(String(row.operacion_id))}
                    onChange={() => toggle(row.operacion_id)}
                    aria-label={`Seleccionar N.V. ${row.nv}`}
                  />
                  <div className="cr-cap-nv__main">
                    <strong>N.V. {row.nv}</strong>
                    <span>
                      {row.cliente || 'Sin cliente'} · {row.comuna || 'Sin comuna'}
                    </span>
                  </div>
                  <div className="cr-cap-nv__numbers">
                    <span>{number(row.bultos)} bultos</span>
                    <span>{number(row.peso_total_kg, 1)} kg</span>
                    <span>{number(row.volumen_total_m3, 4)} m³</span>
                  </div>
                  <span className={`cr-cap-status ${complete ? 'is-complete' : 'is-missing'}`}>
                    {complete ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                    {complete ? 'Lista' : 'Incompleta'}
                  </span>
                  <button
                    className="cr-icon-button"
                    onClick={() => openEditor(row)}
                    title="Editar peso y cubicaje"
                  >
                    <Pencil size={15} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="cr-card cr-cap-compare">
          <div className="cr-card__head">
            <div>
              <span className="cr-kicker">COMPARADOR</span>
              <h3>Propia versus externa</h3>
            </div>
            <Calculator size={22} />
          </div>
          <label>
            <span>Camioneta propia</span>
            <select
              value={comparison.flota_id}
              onChange={(e) => {
                setComparison({ ...comparison, flota_id: e.target.value });
                setResult(null);
              }}
            >
              <option value="">No comparar flota propia</option>
              {catalog.flota
                .filter((item) => item.activo)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre} · {number(item.capacidad_kg)} kg / {number(item.capacidad_m3, 2)}{' '}
                    m³
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>Tarifa externa</span>
            <select
              value={comparison.tarifa_id}
              onChange={(e) => {
                setComparison({ ...comparison, tarifa_id: e.target.value });
                setResult(null);
              }}
            >
              <option value="">No comparar transportista</option>
              {catalog.tarifas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.transportista_nombre} · {item.ambito}
                  {item.localidad ? ` · ${item.localidad}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Distancia total de la ruta (km)</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={comparison.distancia_km}
              onChange={(e) => {
                setComparison({ ...comparison, distancia_km: e.target.value });
                setResult(null);
              }}
            />
          </label>
          <button
            className="cr-button cr-button--orange cr-cap-full"
            onClick={() => evaluate(false)}
            disabled={busy === 'compare'}
          >
            <Calculator size={16} /> {busy === 'compare' ? 'Calculando…' : 'Evaluar alternativas'}
          </button>

          {result && (
            <div className={`cr-cap-result cr-cap-result--${recommendation[2]}`}>
              <div>
                <strong>{recommendation[0]}</strong>
                <p>{recommendation[1]}</p>
              </div>
              <div className="cr-cap-result__grid">
                <span>
                  Ocupación peso
                  <strong>
                    {result.ocupacion_peso_pct == null
                      ? '—'
                      : `${number(result.ocupacion_peso_pct, 1)}%`}
                  </strong>
                </span>
                <span>
                  Ocupación volumen
                  <strong>
                    {result.ocupacion_volumen_pct == null
                      ? '—'
                      : `${number(result.ocupacion_volumen_pct, 1)}%`}
                  </strong>
                </span>
                <span>
                  Costo propio
                  <strong>{result.costo_propio == null ? '—' : money(result.costo_propio)}</strong>
                </span>
                <span>
                  Costo externo
                  <strong>
                    {result.costo_externo == null ? '—' : money(result.costo_externo)}
                  </strong>
                </span>
                <span>
                  Tiempo propio
                  <strong>
                    {result.tiempo_propio_horas == null
                      ? '—'
                      : `${number(result.tiempo_propio_horas, 1)} h`}
                  </strong>
                </span>
                <span>
                  Ahorro potencial
                  <strong>
                    {result.ahorro_estimado == null ? '—' : money(result.ahorro_estimado)}
                  </strong>
                </span>
              </div>
              {result.recomendacion !== 'COMPLETAR_DATOS' && (
                <div className="cr-cap-choice">
                  {result.costo_propio != null && result.cabe && (
                    <button
                      className="cr-button cr-button--dark"
                      onClick={() => evaluate(true, 'PROPIA')}
                      disabled={busy === 'decision-PROPIA'}
                    >
                      <Truck size={15} /> Elegir propia
                    </button>
                  )}
                  {result.costo_externo != null && (
                    <button
                      className="cr-button cr-button--soft"
                      onClick={() => evaluate(true, 'EXTERNA')}
                      disabled={busy === 'decision-EXTERNA'}
                    >
                      <CircleDollarSign size={15} /> Elegir externa
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {editor && (
        <div
          className="cr-cap-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Cubicaje de la N.V."
        >
          <div className="cr-cap-modal__panel">
            <div className="cr-card__head">
              <div>
                <span className="cr-kicker">N.V. {editor.row.nv}</span>
                <h3>Peso y dimensiones reales</h3>
                <p>{editor.row.cliente}</p>
              </div>
              <button className="cr-icon-button" onClick={() => setEditor(null)}>
                <X size={18} />
              </button>
            </div>
            <label className="cr-cap-main-field">
              <span>Peso total de la N.V. (kg) *</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={editor.peso_total_kg}
                onChange={(e) => setEditor({ ...editor, peso_total_kg: e.target.value })}
              />
            </label>
            <div className="cr-cap-toggle">
              <span>¿Todos los bultos tienen igual tamaño?</span>
              <button className={editor.equal ? 'is-active' : ''} onClick={() => setEqual(true)}>
                Sí
              </button>
              <button className={!editor.equal ? 'is-active' : ''} onClick={() => setEqual(false)}>
                No
              </button>
            </div>
            <div className="cr-cap-groups">
              {editor.groups.map((group, index) => (
                <div className="cr-cap-group" key={index}>
                  <strong>Grupo {index + 1}</strong>
                  {['cantidad', 'largo_cm', 'ancho_cm', 'alto_cm'].map((field) => (
                    <label key={field}>
                      <span>
                        {field === 'cantidad'
                          ? 'Cantidad'
                          : field.replace('_cm', '').replace(/^./, (c) => c.toUpperCase()) +
                            ' (cm)'}
                      </span>
                      <input
                        type="number"
                        min="1"
                        max={field === 'cantidad' ? 10000 : 400}
                        value={group[field]}
                        onChange={(e) => updateGroup(index, field, e.target.value)}
                      />
                    </label>
                  ))}
                  <span className="cr-cap-group__volume">
                    {number(calculateGroupVolume(group), 4)} m³
                  </span>
                  {!editor.equal && editor.groups.length > 1 && (
                    <button
                      className="cr-icon-button"
                      onClick={() =>
                        setEditor({
                          ...editor,
                          groups: editor.groups.filter((_, position) => position !== index)
                        })
                      }
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!editor.equal && editor.groups.length < 50 && (
              <button
                className="cr-button cr-button--soft"
                onClick={() =>
                  setEditor({ ...editor, groups: [...editor.groups, { ...EMPTY_GROUP }] })
                }
              >
                <Plus size={15} /> Agregar grupo de bultos
              </button>
            )}
            <div className="cr-cap-volume-total">
              <Ruler size={19} />
              <div>
                <span>Volumen total estimado</span>
                <strong>
                  {number(
                    editor.groups.reduce((sum, group) => sum + calculateGroupVolume(group), 0),
                    4
                  )}{' '}
                  m³
                </strong>
              </div>
              <ChevronDown size={16} />
            </div>
            <div className="cr-cap-modal__actions">
              <button className="cr-button cr-button--ghost" onClick={() => setEditor(null)}>
                Cancelar
              </button>
              <button
                className="cr-button cr-button--orange"
                onClick={saveCubicage}
                disabled={busy === 'cubicage'}
              >
                <Save size={15} /> {busy === 'cubicage' ? 'Guardando…' : 'Guardar carga'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
