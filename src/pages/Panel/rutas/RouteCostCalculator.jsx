import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  RefreshCw,
  Route,
  Save,
  Scale,
  Truck
} from 'lucide-react';
import { toast } from 'sonner';
import { COMUNAS_POR_REGION } from '../../../constants/comunasChile';
import { routeCoordinationService } from './routeCoordinationService';

const money = (value) =>
  Number(value || 0).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  });
const number = (value, digits = 1) =>
  Number(value || 0).toLocaleString('es-CL', { maximumFractionDigits: digits });
const today = () => new Date().toLocaleDateString('en-CA');
const regions = Object.keys(COMUNAS_POR_REGION);
const allCommunes = regions.flatMap((region) =>
  COMUNAS_POR_REGION[region].map((comuna) => ({ region, comuna }))
);
const emptyRate = {
  transportista_id: '',
  ambito: 'SANTIAGO',
  region: '',
  localidad: '',
  cargo_base: 0,
  tarifa_nv: 0,
  tarifa_bulto: 0,
  tarifa_kg: 0,
  tarifa_km: 0,
  minimo: 0,
  recargo_pct: 0,
  incluye_iva: '',
  vigencia_desde: today(),
  notas: ''
};

function RateInput({ label, field, value, onChange }) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(event) => onChange(field, event.target.value)}
      />
    </label>
  );
}

export default function RouteCostCalculator() {
  const [catalog, setCatalog] = useState({
    transportistas: [],
    tarifas: [],
    cotizaciones_recientes: []
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [showRate, setShowRate] = useState(false);
  const [rate, setRate] = useState(emptyRate);
  const [route, setRoute] = useState(null);
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({
    origen: 'Santiago',
    destino: '',
    region: 'Metropolitana de Santiago',
    ambito: 'SANTIAGO',
    nv_referencia: '',
    cantidad_nv: 1,
    bultos: 1,
    kilos: '',
    valor_nv_total: '',
    espera_motivo: ''
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCatalog(await routeCoordinationService.costCatalog());
    } catch (error) {
      toast.error(error.message || 'No se pudo cargar el tarifario privado.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const availableRates = useMemo(() => {
    const destination = form.destino.trim().toLocaleLowerCase('es');
    return (catalog.tarifas || []).filter((item) => {
      if (!['NACIONAL', form.ambito].includes(item.ambito)) return false;
      if (item.region && item.region !== form.region) return false;
      if (item.localidad && item.localidad.toLocaleLowerCase('es') !== destination) return false;
      return true;
    });
  }, [catalog.tarifas, form.ambito, form.destino, form.region]);

  const setDestination = (value) => {
    const match = allCommunes.find(
      (item) => item.comuna.toLocaleLowerCase('es') === value.trim().toLocaleLowerCase('es')
    );
    const region = match?.region || form.region;
    setForm({
      ...form,
      destino: value,
      region,
      ambito: region === 'Metropolitana de Santiago' ? 'SANTIAGO' : 'REGIONES'
    });
    setRoute(null);
    setResults([]);
  };

  const calculateDistance = async () => {
    if (form.destino.trim().length < 2)
      return toast.warning('Ingresa una comuna, ciudad o pueblo.');
    setBusy('distance');
    try {
      const data = await routeCoordinationService.calculateDistance(form.origen, form.destino);
      setRoute(data);
      toast.success(data.cache ? 'Distancia recuperada del historial.' : 'Ruta vial calculada.');
    } catch (error) {
      toast.error(error.message || 'No se pudo calcular la distancia vial.');
    } finally {
      setBusy('');
    }
  };

  const payload = (tarifaId, guardar = false) => ({
    tarifa_id: tarifaId,
    ...form,
    distancia_km: route?.distancia_km || null,
    duracion_minutos: route?.duracion_minutos || null,
    guardar
  });

  const compare = async () => {
    if (!form.destino.trim()) return toast.warning('Ingresa el destino del despacho.');
    if (!availableRates.length)
      return toast.warning('No hay tarifas configuradas para este destino. Agrega una primero.');
    setBusy('compare');
    try {
      const calculated = await Promise.all(
        availableRates.map((item) => routeCoordinationService.calculateCost(payload(item.id)))
      );
      setResults(calculated.sort((a, b) => Number(a.total) - Number(b.total)));
    } catch (error) {
      toast.error(error.message || 'No se pudo comparar el tarifario.');
    } finally {
      setBusy('');
    }
  };

  const saveQuote = async (tarifaId) => {
    setBusy(`quote-${tarifaId}`);
    try {
      const result = await routeCoordinationService.calculateCost(payload(tarifaId, true));
      toast.success(`Cotización guardada: ${money(result.total)}.`);
      await load();
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar la cotización.');
    } finally {
      setBusy('');
    }
  };

  const updateRate = (field, value) => setRate((current) => ({ ...current, [field]: value }));
  const saveRate = async (event) => {
    event.preventDefault();
    if (!rate.transportista_id) return toast.warning('Selecciona un transportista.');
    const values = ['cargo_base', 'tarifa_nv', 'tarifa_bulto', 'tarifa_kg', 'tarifa_km', 'minimo'];
    if (!values.some((key) => Number(rate[key]) > 0))
      return toast.warning('La tarifa debe tener al menos un valor mayor que cero.');
    setBusy('rate');
    try {
      await routeCoordinationService.saveRate({
        ...rate,
        recargo_pct: Number(rate.recargo_pct || 0) / 100,
        incluye_iva: rate.incluye_iva === '' ? null : rate.incluye_iva === 'true'
      });
      toast.success('Tarifa guardada y disponible para comparar.');
      setRate(emptyRate);
      setShowRate(false);
      await load();
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar la tarifa.');
    } finally {
      setBusy('');
    }
  };

  if (loading)
    return (
      <div className="crc-loading">
        <RefreshCw className="cr-spin" /> Preparando tarifario y costos…
      </div>
    );

  return (
    <div className="crc-shell">
      <section className="crc-hero cr-card">
        <div className="crc-hero__icon">
          <Calculator />
        </div>
        <div>
          <span className="cr-kicker">MODELO DE COSTO LOGÍSTICO</span>
          <h2>Calculadora de despacho</h2>
          <p>Compara costo por N.V., bulto, kilo, kilómetro y destino sin alterar el SLA.</p>
        </div>
        <button
          className="cr-button cr-button--soft"
          onClick={() => setShowRate((value) => !value)}
        >
          <Plus size={15} /> Nueva tarifa
        </button>
      </section>

      <section className="crc-sla">
        <Clock3 size={18} />
        <div>
          <strong>Compromiso: 48 horas continuas</strong>
          <span>
            Bodega, falta de transporte o aprobación de costo se registran como espera atribuible,
            pero no borran el incumplimiento.
          </span>
        </div>
      </section>

      {showRate && (
        <form className="crc-rate cr-card" onSubmit={saveRate}>
          <div className="crc-section-title">
            <Truck size={18} />
            <div>
              <h3>Configurar tarifa contractual</h3>
              <p>Los valores quedan versionados por vigencia y zona.</p>
            </div>
          </div>
          <label className="crc-span-2">
            <span>Transportista</span>
            <select
              value={rate.transportista_id}
              onChange={(event) => updateRate('transportista_id', event.target.value)}
              required
            >
              <option value="">Seleccionar…</option>
              {catalog.transportistas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Ámbito</span>
            <select
              value={rate.ambito}
              onChange={(event) => updateRate('ambito', event.target.value)}
            >
              <option value="SANTIAGO">Santiago</option>
              <option value="REGIONES">Regiones</option>
              <option value="NACIONAL">Todo Chile</option>
            </select>
          </label>
          <label>
            <span>Región específica</span>
            <select
              value={rate.region}
              onChange={(event) => updateRate('region', event.target.value)}
            >
              <option value="">Todas</option>
              {regions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Comuna/ciudad específica</span>
            <input
              list="crc-localidades"
              value={rate.localidad}
              onChange={(event) => updateRate('localidad', event.target.value)}
              placeholder="Opcional"
            />
          </label>
          <RateInput
            label="Cargo base/viaje"
            field="cargo_base"
            value={rate.cargo_base}
            onChange={updateRate}
          />
          <RateInput
            label="Precio por N.V."
            field="tarifa_nv"
            value={rate.tarifa_nv}
            onChange={updateRate}
          />
          <RateInput
            label="Precio por bulto"
            field="tarifa_bulto"
            value={rate.tarifa_bulto}
            onChange={updateRate}
          />
          <RateInput
            label="Precio por kilo"
            field="tarifa_kg"
            value={rate.tarifa_kg}
            onChange={updateRate}
          />
          <RateInput
            label="Precio por kilómetro"
            field="tarifa_km"
            value={rate.tarifa_km}
            onChange={updateRate}
          />
          <RateInput
            label="Cobro mínimo"
            field="minimo"
            value={rate.minimo}
            onChange={updateRate}
          />
          <label>
            <span>Recargo %</span>
            <input
              type="number"
              min="0"
              max="1000"
              step="0.1"
              value={rate.recargo_pct}
              onChange={(event) => updateRate('recargo_pct', event.target.value)}
            />
          </label>
          <label>
            <span>IVA</span>
            <select
              value={rate.incluye_iva}
              onChange={(event) => updateRate('incluye_iva', event.target.value)}
            >
              <option value="">Por confirmar</option>
              <option value="true">Incluido</option>
              <option value="false">No incluido</option>
            </select>
          </label>
          <label>
            <span>Vigente desde</span>
            <input
              type="date"
              value={rate.vigencia_desde}
              onChange={(event) => updateRate('vigencia_desde', event.target.value)}
            />
          </label>
          <label className="crc-span-2">
            <span>Notas/condiciones</span>
            <input
              value={rate.notas}
              onChange={(event) => updateRate('notas', event.target.value)}
              maxLength="300"
              placeholder="Ej.: recargo rural, entrega en sucursal, tarifa final…"
            />
          </label>
          <button className="cr-button cr-button--orange" disabled={busy === 'rate'}>
            <Save size={15} /> Guardar tarifa
          </button>
        </form>
      )}

      <section className="crc-grid">
        <div className="cr-card crc-form-card">
          <div className="crc-section-title">
            <MapPin size={18} />
            <div>
              <h3>1. Destino y distancia</h3>
              <p>Ruta vial estimada desde Santiago.</p>
            </div>
          </div>
          <div className="crc-fields">
            <label>
              <span>Origen</span>
              <input
                value={form.origen}
                onChange={(e) => setForm({ ...form, origen: e.target.value })}
              />
            </label>
            <label className="crc-span-2">
              <span>Comuna, ciudad o pueblo</span>
              <input
                list="crc-localidades"
                value={form.destino}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="Ej.: Puerto Montt, Pica, Villa Alemana…"
              />
            </label>
            <label>
              <span>Región</span>
              <select
                value={form.region}
                onChange={(event) => {
                  const region = event.target.value;
                  setForm({
                    ...form,
                    region,
                    ambito: region === 'Metropolitana de Santiago' ? 'SANTIAGO' : 'REGIONES'
                  });
                  setResults([]);
                }}
              >
                {regions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <button
            className="cr-button cr-button--dark"
            onClick={calculateDistance}
            disabled={busy === 'distance'}
          >
            <Route size={15} />{' '}
            {busy === 'distance' ? 'Calculando…' : 'Calcular distancia y tiempo'}
          </button>
          {route && (
            <div className="crc-route-result">
              <div>
                <strong>{number(route.distancia_km)} km</strong>
                <span>distancia vial</span>
              </div>
              <div>
                <strong>
                  {Math.floor(route.duracion_minutos / 60)} h {route.duracion_minutos % 60} min
                </strong>
                <span>tiempo estimado sin detenciones</span>
              </div>
              <small>{route.cache ? 'Resultado en caché' : 'Nuevo cálculo'} · OpenStreetMap</small>
            </div>
          )}
          <small className="crc-attribution">
            Ingresa solo localidades, no direcciones privadas. © OpenStreetMap contributors · ruta
            estimada, sujeta a tránsito y condiciones reales.
          </small>
        </div>

        <div className="cr-card crc-form-card">
          <div className="crc-section-title">
            <Scale size={18} />
            <div>
              <h3>2. Carga y valor</h3>
              <p>El costo por N.V. depende también de la consolidación.</p>
            </div>
          </div>
          <div className="crc-fields crc-fields--load">
            <label>
              <span>N.V. referencia</span>
              <input
                value={form.nv_referencia}
                onChange={(e) => setForm({ ...form, nv_referencia: e.target.value })}
              />
            </label>
            <label>
              <span>Cantidad N.V.</span>
              <input
                type="number"
                min="1"
                value={form.cantidad_nv}
                onChange={(e) => setForm({ ...form, cantidad_nv: e.target.value })}
              />
            </label>
            <label>
              <span>Bultos</span>
              <input
                type="number"
                min="1"
                value={form.bultos}
                onChange={(e) => setForm({ ...form, bultos: e.target.value })}
              />
            </label>
            <label>
              <span>Kilos</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.kilos}
                onChange={(e) => setForm({ ...form, kilos: e.target.value })}
                placeholder="Opcional"
              />
            </label>
            <label>
              <span>Valor total N.V.</span>
              <input
                type="number"
                min="0"
                value={form.valor_nv_total}
                onChange={(e) => setForm({ ...form, valor_nv_total: e.target.value })}
                placeholder="Para medir % flete/venta"
              />
            </label>
            <label>
              <span>Espera atribuible</span>
              <select
                value={form.espera_motivo}
                onChange={(e) => setForm({ ...form, espera_motivo: e.target.value })}
              >
                <option value="">Sin espera</option>
                <option value="BODEGA">Bodega</option>
                <option value="FALTA_TRANSPORTE">Falta de transporte</option>
                <option value="APROBACION_COSTO">Aprobación de costo</option>
                <option value="OTRO">Otro</option>
              </select>
            </label>
          </div>
          <button
            className="cr-button cr-button--orange"
            onClick={compare}
            disabled={busy === 'compare'}
          >
            <Calculator size={15} />{' '}
            {busy === 'compare' ? 'Comparando…' : `Comparar ${availableRates.length} tarifa(s)`}
          </button>
        </div>
      </section>

      <section className="cr-card crc-results">
        <div className="crc-section-title">
          <Truck size={18} />
          <div>
            <h3>3. Comparación económica</h3>
            <p>Ordenada desde el menor costo calculable.</p>
          </div>
        </div>
        {!results.length ? (
          <div className="crc-empty">
            <Calculator />
            <strong>Aún no hay comparación</strong>
            <span>
              Completa destino y carga. Las tarifas inexistentes nunca se estiman como $0.
            </span>
          </div>
        ) : (
          <div className="crc-result-grid">
            {results.map((item, index) => (
              <article key={item.tarifa.id} className={index === 0 ? 'is-best' : ''}>
                <header>
                  <div>
                    <small>{item.tarifa.ambito}</small>
                    <h4>{item.tarifa.transportista_nombre}</h4>
                  </div>
                  {index === 0 && (
                    <span>
                      <CheckCircle2 size={13} /> Menor costo
                    </span>
                  )}
                </header>
                <strong className="crc-total">{money(item.total)}</strong>
                <dl>
                  <div>
                    <dt>Por N.V.</dt>
                    <dd>{money(item.costo_por_nv)}</dd>
                  </div>
                  <div>
                    <dt>Por bulto</dt>
                    <dd>{money(item.costo_por_bulto)}</dd>
                  </div>
                  <div>
                    <dt>% venta</dt>
                    <dd>
                      {item.porcentaje_venta == null ? '—' : `${number(item.porcentaje_venta, 2)}%`}
                    </dd>
                  </div>
                  <div>
                    <dt>Recargo</dt>
                    <dd>{money(item.recargo)}</dd>
                  </div>
                </dl>
                <p>
                  Base {money(item.formula.cargo_base)} + N.V. {money(item.formula.por_nv)} + bultos{' '}
                  {money(item.formula.por_bulto)} + kg {money(item.formula.por_kg)} + km{' '}
                  {money(item.formula.por_km)}.
                </p>
                {item.tarifa.incluye_iva == null && (
                  <div className="crc-warning">
                    <AlertTriangle size={13} /> IVA por confirmar
                  </div>
                )}
                <button
                  className="cr-button cr-button--soft"
                  onClick={() => saveQuote(item.tarifa.id)}
                  disabled={busy === `quote-${item.tarifa.id}`}
                >
                  <Save size={14} /> Guardar cotización
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="crc-formula cr-card">
        <strong>Fórmula auditable</strong>
        <code>
          Total = máximo(mínimo, cargo base + N.V.×tarifa + bultos×tarifa + kg×tarifa + km×tarifa) +
          recargo
        </code>
        <span>
          Si Transfarma cobra $5.800 por bulto en Santiago: 1 N.V. con 3 bultos = $17.400; 5 N.V.
          consolidadas con 12 bultos = $69.600, equivalente a $13.920 por N.V.
        </span>
      </section>

      <datalist id="crc-localidades">
        {allCommunes.map(({ region, comuna }) => (
          <option key={`${region}-${comuna}`} value={comuna}>
            {region}
          </option>
        ))}
      </datalist>
    </div>
  );
}
