import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  CircleDollarSign,
  Clock3,
  LockKeyhole,
  MapPinned,
  Navigation,
  PackageCheck,
  Plus,
  RefreshCw,
  Route,
  Sparkles,
  Trash2,
  Truck,
  UsersRound
} from 'lucide-react';
import { toast } from 'sonner';
import RouteMap from './RouteMap';
import RouteAnalytics from './RouteAnalytics';
import RouteCostCalculator from './RouteCostCalculator';
import {
  optimizeStops,
  SANTIAGO_COMMUNES,
  SECTOR_COLORS,
  SECTOR_COMMUNES
} from './routeCoordination';
import { routeCoordinationService } from './routeCoordinationService';
import './coordinacionRutas.css';

const today = () => new Date().toLocaleDateString('en-CA');
const realLetters = (value) => /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(String(value || '').trim());
const stopKey = (item) => `${item.tipo || 'NV'}:${item.operacion_id || item.id}`;

function Badge({ children, tone = 'slate' }) {
  return <span className={`cr-badge cr-badge--${tone}`}>{children}</span>;
}

function Empty({ children }) {
  return <div className="cr-empty">{children}</div>;
}

export default function CoordinacionRutas() {
  const [view, setView] = useState('operation');
  const [data, setData] = useState({ shipping: [], retiros: [], planes: [], transportistas: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState('');
  const [sector, setSector] = useState('Todos');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [showPickup, setShowPickup] = useState(false);
  const [planForm, setPlanForm] = useState({
    fecha: today(),
    vuelta: 1,
    transportistaId: '',
    notas: ''
  });
  const [pickup, setPickup] = useState({
    cliente: '',
    direccion: '',
    contacto: '',
    comuna: '',
    fecha_solicitada: today(),
    prioridad: false,
    notas: ''
  });

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const next = await routeCoordinationService.dashboard();
      setData({ shipping: [], retiros: [], planes: [], transportistas: [], ...next });
      setSelectedPlanId((current) => {
        if (current && next?.planes?.some((item) => item.id === current)) return current;
        return next?.planes?.[0]?.id || '';
      });
    } catch (error) {
      toast.error(error.message || 'No se pudo cargar Coordinación Rutas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    return routeCoordinationService.subscribe(() => load(true));
  }, [load]);

  const selectedPlan = useMemo(
    () => data.planes.find((item) => item.id === selectedPlanId) || null,
    [data.planes, selectedPlanId]
  );
  const shippingSantiago = useMemo(
    () => data.shipping.filter((item) => item.sector !== 'Fuera de Santiago'),
    [data.shipping]
  );
  const outside = useMemo(
    () => data.shipping.filter((item) => item.sector === 'Fuera de Santiago'),
    [data.shipping]
  );
  const sectorCounts = useMemo(
    () =>
      Object.keys(SECTOR_COMMUNES).map((name) => ({
        name,
        total: shippingSantiago.filter((item) => item.sector === name).length,
        pending: shippingSantiago.filter((item) => item.sector === name && !item.plan_id).length,
        urgent: shippingSantiago.filter((item) => item.sector === name && item.urgente).length
      })),
    [shippingSantiago]
  );
  const mapItems = useMemo(
    () => [
      ...shippingSantiago.map((item) => ({ ...item, tipo: 'NV' })),
      ...data.retiros.map((item) => ({ ...item, tipo: 'RETIRO' }))
    ],
    [shippingSantiago, data.retiros]
  );

  const run = async (key, action, success) => {
    setBusy(key);
    try {
      await action();
      if (success) toast.success(success);
      await load(true);
    } catch (error) {
      toast.error(error.message || 'No se pudo completar la operación.');
    } finally {
      setBusy('');
    }
  };

  const createPlan = async (event) => {
    event.preventDefault();
    if (!planForm.transportistaId) return toast.warning('Selecciona un transportista.');
    await run(
      'create-plan',
      async () => {
        const plan = await routeCoordinationService.createPlan(planForm);
        setSelectedPlanId(plan.id);
      },
      'Ruta en borrador creada.'
    );
  };

  const createPickup = async (event) => {
    event.preventDefault();
    if (![pickup.cliente, pickup.direccion].every(realLetters) || !String(pickup.contacto).trim())
      return toast.warning('Completa cliente, dirección y contacto con datos reales.');
    if (!pickup.comuna) return toast.warning('Selecciona una comuna.');
    await run(
      'create-pickup',
      async () => {
        await routeCoordinationService.createPickup(pickup);
        setPickup({
          cliente: '',
          direccion: '',
          contacto: '',
          comuna: '',
          fecha_solicitada: today(),
          prioridad: false,
          notas: ''
        });
        setShowPickup(false);
      },
      'Retiro agregado a la planificación.'
    );
  };

  const addStop = (type, id) => {
    if (!selectedPlan) return toast.warning('Crea o selecciona una ruta primero.');
    if (selectedPlan.estado !== 'BORRADOR')
      return toast.warning('Solo un borrador puede editarse.');
    return run(
      `add-${type}-${id}`,
      () => routeCoordinationService.addStop(selectedPlan.id, type, id),
      'Parada incorporada a la ruta.'
    );
  };

  const optimize = () => {
    if (!selectedPlan || selectedPlan.paradas.length < 2)
      return toast.warning('La ruta necesita al menos dos paradas.');
    const ordered = optimizeStops(selectedPlan.paradas);
    return run(
      'optimize',
      () =>
        routeCoordinationService.reorder(
          selectedPlan.id,
          ordered.map((item) => item.id)
        ),
      'Orden sugerido calculado por cercanía.'
    );
  };

  if (loading) {
    return (
      <div className="cr-loading">
        <Navigation className="cr-spin" size={28} /> Preparando mapa y despachos…
      </div>
    );
  }

  return (
    <section className="cr-shell">
      <header className="cr-hero">
        <div className="cr-hero__icon">
          <Route size={26} />
        </div>
        <div>
          <div className="cr-eyebrow">
            <LockKeyhole size={13} /> PILOTO PRIVADO · SOLO ADMINISTRADOR
          </div>
          <h2>Coordinación de Rutas</h2>
          <p>Despachos Shipping y retiros organizados por sector, fecha, vuelta y transportista.</p>
        </div>
        <button
          className="cr-button cr-button--ghost"
          onClick={() => load(true)}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'cr-spin' : ''} /> Actualizar
        </button>
      </header>

      <nav className="cr-view-tabs" aria-label="Vistas de Coordinación de Rutas">
        <button
          className={view === 'operation' ? 'is-active' : ''}
          onClick={() => setView('operation')}
        >
          <Navigation size={16} /> Operación y mapa
        </button>
        <button
          className={view === 'analytics' ? 'is-active' : ''}
          onClick={() => setView('analytics')}
        >
          <BarChart3 size={16} /> Diagnóstico histórico
        </button>
        <button className={view === 'costs' ? 'is-active' : ''} onClick={() => setView('costs')}>
          <CircleDollarSign size={16} /> Costos y distancias
        </button>
      </nav>

      {view === 'costs' ? (
        <RouteCostCalculator />
      ) : view === 'analytics' ? (
        <RouteAnalytics />
      ) : (
        <>
          <div className="cr-kpis">
            <article>
              <MapPinned />
              <div>
                <strong>{shippingSantiago.length}</strong>
                <span>Despachos Santiago</span>
              </div>
            </article>
            <article>
              <AlertTriangle />
              <div>
                <strong>{shippingSantiago.filter((x) => x.urgente).length}</strong>
                <span>Prioridad alta</span>
              </div>
            </article>
            <article>
              <PackageCheck />
              <div>
                <strong>{data.retiros.length}</strong>
                <span>Retiros abiertos</span>
              </div>
            </article>
            <article>
              <Truck />
              <div>
                <strong>{data.planes.length}</strong>
                <span>Rutas planificadas</span>
              </div>
            </article>
          </div>

          <div className="cr-map-layout">
            <div className="cr-card cr-map-card">
              <div className="cr-card__head">
                <div>
                  <span className="cr-kicker">MAPA OPERACIONAL</span>
                  <h3>Despachos activos por sector</h3>
                </div>
                <Badge tone="green">
                  <CircleDot size={11} /> Sincronización activa
                </Badge>
              </div>
              <RouteMap items={mapItems} selectedPlan={selectedPlan} sector={sector} />
              <div className="cr-map-note">
                <CircleDot size={14} /> Los puntos sin latitud histórica se muestran temporalmente
                en el centro de su comuna.
              </div>
            </div>

            <aside className="cr-card cr-sector-card">
              <div className="cr-card__head">
                <div>
                  <span className="cr-kicker">COBERTURA</span>
                  <h3>Sectores de Santiago</h3>
                </div>
              </div>
              <button
                className={`cr-sector ${sector === 'Todos' ? 'is-active' : ''}`}
                onClick={() => setSector('Todos')}
              >
                <span className="cr-sector__dot" style={{ background: '#0f172a' }} />
                <div>
                  <strong>Todos los sectores</strong>
                  <small>{shippingSantiago.length} despachos</small>
                </div>
                <ChevronRight size={16} />
              </button>
              {sectorCounts.map((item) => (
                <button
                  key={item.name}
                  className={`cr-sector ${sector === item.name ? 'is-active' : ''}`}
                  onClick={() => setSector(item.name)}
                >
                  <span
                    className="cr-sector__dot"
                    style={{ background: SECTOR_COLORS[item.name] }}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {item.pending} por asignar · {item.total} total
                    </small>
                  </div>
                  {item.urgent > 0 && <Badge tone="red">{item.urgent}</Badge>}
                  <ChevronRight size={16} />
                </button>
              ))}
              {outside.length > 0 && (
                <div className="cr-outside">
                  <AlertTriangle size={17} />
                  <div>
                    <strong>{outside.length} fuera de Santiago</strong>
                    <span>Reservadas para la siguiente etapa del proyecto.</span>
                  </div>
                </div>
              )}
            </aside>
          </div>

          <div className="cr-workspace">
            <div className="cr-card">
              <div className="cr-card__head">
                <div>
                  <span className="cr-kicker">PLANIFICACIÓN</span>
                  <h3>Crear ruta y vuelta</h3>
                </div>
                <button
                  className="cr-button cr-button--soft"
                  onClick={() => setShowPickup((value) => !value)}
                >
                  <Plus size={15} /> Nuevo retiro
                </button>
              </div>
              <form className="cr-plan-form" onSubmit={createPlan}>
                <label>
                  <span>Fecha</span>
                  <input
                    type="date"
                    min={today()}
                    value={planForm.fecha}
                    onChange={(e) => setPlanForm({ ...planForm, fecha: e.target.value })}
                    required
                  />
                </label>
                <label>
                  <span>Vuelta del día</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={planForm.vuelta}
                    onChange={(e) => setPlanForm({ ...planForm, vuelta: e.target.value })}
                    required
                  />
                </label>
                <label className="cr-grow">
                  <span>Transportista</span>
                  <select
                    value={planForm.transportistaId}
                    onChange={(e) => setPlanForm({ ...planForm, transportistaId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar transportista…</option>
                    {data.transportistas.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="cr-button cr-button--dark" disabled={busy === 'create-plan'}>
                  <Plus size={16} /> Crear borrador
                </button>
              </form>

              {showPickup && (
                <form className="cr-pickup-form" onSubmit={createPickup}>
                  <div className="cr-form-title">
                    <PackageCheck size={18} />
                    <div>
                      <strong>Solicitud de retiro</strong>
                      <span>Se incorporará como una parada disponible.</span>
                    </div>
                  </div>
                  <label>
                    <span>Cliente *</span>
                    <input
                      value={pickup.cliente}
                      onChange={(e) => setPickup({ ...pickup, cliente: e.target.value })}
                      maxLength="140"
                      placeholder="Nombre del cliente"
                      required
                    />
                  </label>
                  <label className="cr-wide">
                    <span>Dirección *</span>
                    <input
                      value={pickup.direccion}
                      onChange={(e) => setPickup({ ...pickup, direccion: e.target.value })}
                      maxLength="180"
                      placeholder="Calle, número y referencia"
                      required
                    />
                  </label>
                  <label>
                    <span>Contacto *</span>
                    <input
                      value={pickup.contacto}
                      onChange={(e) => setPickup({ ...pickup, contacto: e.target.value })}
                      maxLength="120"
                      placeholder="Nombre o teléfono"
                      required
                    />
                  </label>
                  <label>
                    <span>Comuna *</span>
                    <select
                      value={pickup.comuna}
                      onChange={(e) => setPickup({ ...pickup, comuna: e.target.value })}
                      required
                    >
                      <option value="">Seleccionar comuna…</option>
                      {SANTIAGO_COMMUNES.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Fecha solicitada</span>
                    <input
                      type="date"
                      min={today()}
                      value={pickup.fecha_solicitada}
                      onChange={(e) => setPickup({ ...pickup, fecha_solicitada: e.target.value })}
                    />
                  </label>
                  <label className="cr-check">
                    <input
                      type="checkbox"
                      checked={pickup.prioridad}
                      onChange={(e) => setPickup({ ...pickup, prioridad: e.target.checked })}
                    />
                    <span>Retiro prioritario</span>
                  </label>
                  <button
                    className="cr-button cr-button--orange"
                    disabled={busy === 'create-pickup'}
                  >
                    <Plus size={16} /> Guardar retiro
                  </button>
                </form>
              )}
            </div>

            <div className="cr-card">
              <div className="cr-card__head">
                <div>
                  <span className="cr-kicker">RUTAS</span>
                  <h3>Agenda operativa</h3>
                </div>
                <Badge>{data.planes.length} activas</Badge>
              </div>
              <div className="cr-plan-tabs">
                {data.planes.length === 0 && (
                  <Empty>Aún no hay rutas. Crea el primer borrador arriba.</Empty>
                )}
                {data.planes.map((plan) => (
                  <button
                    key={plan.id}
                    className={`cr-plan-tab ${selectedPlanId === plan.id ? 'is-active' : ''}`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <CalendarDays size={17} />
                    <div>
                      <strong>
                        {new Date(`${plan.fecha}T12:00:00`).toLocaleDateString('es-CL')} · Vuelta{' '}
                        {plan.vuelta}
                      </strong>
                      <span>{plan.transportista_nombre}</span>
                    </div>
                    <Badge tone={plan.estado === 'BORRADOR' ? 'orange' : 'green'}>
                      {plan.estado}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="cr-detail-grid">
            <div className="cr-card">
              <div className="cr-card__head">
                <div>
                  <span className="cr-kicker">DESPACHOS DISPONIBLES</span>
                  <h3>{sector === 'Todos' ? 'Todas las zonas' : `Sector ${sector}`}</h3>
                </div>
                <Badge>{shippingSantiago.filter((item) => !item.plan_id).length} por asignar</Badge>
              </div>
              <div className="cr-dispatch-list">
                {shippingSantiago.filter(
                  (item) => (sector === 'Todos' || item.sector === sector) && !item.plan_id
                ).length === 0 && <Empty>No hay N.V. pendientes para este filtro.</Empty>}
                {shippingSantiago
                  .filter((item) => (sector === 'Todos' || item.sector === sector) && !item.plan_id)
                  .map((item) => (
                    <article className="cr-dispatch" key={stopKey(item)}>
                      <div
                        className="cr-stop-index"
                        style={{ background: SECTOR_COLORS[item.sector] }}
                      >
                        <Navigation size={15} />
                      </div>
                      <div className="cr-dispatch__body">
                        <div>
                          <strong>N.V. {item.nv}</strong>
                          {item.urgente && <Badge tone="red">PRIORIDAD</Badge>}
                          <Badge>{item.sector}</Badge>
                        </div>
                        <h4>{item.cliente}</h4>
                        <p>
                          {item.direccion} · {item.comuna}
                        </p>
                      </div>
                      <button
                        className="cr-icon-button"
                        title="Agregar a la ruta seleccionada"
                        onClick={() => addStop('NV', item.operacion_id)}
                        disabled={
                          !selectedPlan ||
                          selectedPlan.estado !== 'BORRADOR' ||
                          busy === `add-NV-${item.operacion_id}`
                        }
                      >
                        <Plus size={18} />
                      </button>
                    </article>
                  ))}
              </div>
            </div>

            <div className="cr-card cr-route-detail">
              <div className="cr-card__head">
                <div>
                  <span className="cr-kicker">RUTA SELECCIONADA</span>
                  <h3>
                    {selectedPlan
                      ? `${selectedPlan.transportista_nombre} · Vuelta ${selectedPlan.vuelta}`
                      : 'Sin selección'}
                  </h3>
                </div>
                {selectedPlan && (
                  <Badge tone={selectedPlan.estado === 'BORRADOR' ? 'orange' : 'green'}>
                    {selectedPlan.estado}
                  </Badge>
                )}
              </div>
              {!selectedPlan ? (
                <Empty>Selecciona o crea una ruta para comenzar.</Empty>
              ) : (
                <>
                  <div className="cr-route-meta">
                    <span>
                      <CalendarDays size={15} />{' '}
                      {new Date(`${selectedPlan.fecha}T12:00:00`).toLocaleDateString('es-CL')}
                    </span>
                    <span>
                      <Truck size={15} /> {selectedPlan.transportista_nombre}
                    </span>
                    <span>
                      <Clock3 size={15} /> Vuelta {selectedPlan.vuelta}
                    </span>
                  </div>
                  <div className="cr-route-actions">
                    <button
                      className="cr-button cr-button--soft"
                      onClick={optimize}
                      disabled={selectedPlan.estado !== 'BORRADOR' || busy === 'optimize'}
                    >
                      <Sparkles size={15} /> Sugerir orden
                    </button>
                    {selectedPlan.estado === 'BORRADOR' && (
                      <button
                        className="cr-button cr-button--dark"
                        onClick={() =>
                          run(
                            'confirm',
                            () =>
                              routeCoordinationService.changePlanStatus(
                                selectedPlan.id,
                                'CONFIRMADA'
                              ),
                            'Ruta confirmada.'
                          )
                        }
                      >
                        <CheckCircle2 size={15} /> Confirmar ruta
                      </button>
                    )}
                    {selectedPlan.estado === 'CONFIRMADA' && (
                      <button
                        className="cr-button cr-button--orange"
                        onClick={() =>
                          run(
                            'start',
                            () =>
                              routeCoordinationService.changePlanStatus(selectedPlan.id, 'EN_RUTA'),
                            'Ruta iniciada.'
                          )
                        }
                      >
                        <ArrowRight size={15} /> Iniciar ruta
                      </button>
                    )}
                  </div>
                  <div className="cr-stops">
                    {selectedPlan.paradas.length === 0 && (
                      <Empty>Agrega despachos o retiros desde las listas.</Empty>
                    )}
                    {selectedPlan.paradas.map((stop, index) => (
                      <article className="cr-stop" key={stop.id}>
                        <div className="cr-stop-index">{index + 1}</div>
                        <div>
                          <div>
                            <strong>{stop.nv ? `N.V. ${stop.nv}` : 'Retiro'}</strong>
                            <Badge tone={stop.tipo === 'RETIRO' ? 'green' : 'slate'}>
                              {stop.tipo}
                            </Badge>
                            {stop.urgente && <Badge tone="red">PRIORIDAD</Badge>}
                          </div>
                          <h4>{stop.cliente}</h4>
                          <p>
                            {stop.direccion} · {stop.comuna}
                          </p>
                        </div>
                        {selectedPlan.estado === 'BORRADOR' && (
                          <button
                            className="cr-icon-button cr-icon-button--danger"
                            onClick={() =>
                              run(
                                `remove-${stop.id}`,
                                () => routeCoordinationService.removeStop(stop.id),
                                'Parada retirada de la ruta.'
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="cr-card">
            <div className="cr-card__head">
              <div>
                <span className="cr-kicker">RETIROS</span>
                <h3>Solicitudes listas para asignar</h3>
              </div>
              <UsersRound size={20} />
            </div>
            <div className="cr-pickup-list">
              {data.retiros.filter((item) => item.estado === 'PENDIENTE').length === 0 && (
                <Empty>No hay retiros pendientes.</Empty>
              )}
              {data.retiros
                .filter((item) => item.estado === 'PENDIENTE')
                .map((item) => (
                  <article key={item.id}>
                    <div>
                      <strong>{item.cliente}</strong>
                      {item.prioridad && <Badge tone="red">PRIORIDAD</Badge>}
                      <Badge tone="green">{item.sector}</Badge>
                    </div>
                    <p>
                      {item.direccion} · {item.comuna}
                    </p>
                    <small>{item.contacto}</small>
                    <button
                      className="cr-button cr-button--soft"
                      onClick={() => addStop('RETIRO', item.id)}
                      disabled={!selectedPlan || selectedPlan.estado !== 'BORRADOR'}
                    >
                      <Plus size={14} /> Asignar
                    </button>
                  </article>
                ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
