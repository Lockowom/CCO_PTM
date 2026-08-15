import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  MapPin,
  Package,
  RefreshCw,
  Scale,
  ShieldCheck,
  Truck,
  Upload
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { routeCoordinationService } from './routeCoordinationService';
import { FREIGHT_TEMPLATE_HEADERS, normalizeFreightRows } from './routeFreightImport';
import { exportRouteAnalyticsExcel, exportRouteAnalyticsPdf } from './routeExecutiveExport';

const number = (value, digits = 0) =>
  Number(value || 0).toLocaleString('es-CL', { maximumFractionDigits: digits });
const percentage = (part, total) => (total ? (100 * Number(part || 0)) / Number(total) : 0);

function Metric({ icon: Icon, label, value, helper, tone = 'blue' }) {
  return (
    <article className={`cra-metric cra-metric--${tone}`}>
      <span>
        <Icon size={18} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        {helper && <em>{helper}</em>}
      </div>
    </article>
  );
}

function Question({ number: index, title, answer, children }) {
  return (
    <article className="cra-question">
      <span className="cra-question__index">{index}</span>
      <div>
        <small>PREGUNTA DE GESTIÓN</small>
        <h3>{title}</h3>
        <strong>{answer}</strong>
        {children}
      </div>
    </article>
  );
}

export default function RouteAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [grain, setGrain] = useState('month');
  const [range, setRange] = useState({ desde: '', hasta: '' });
  const inputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await routeCoordinationService.analytics(range.desde, range.hasta));
    } catch (error) {
      toast.error(error.message || 'No se pudo cargar el histórico logístico.');
    } finally {
      setLoading(false);
    }
  }, [range.desde, range.hasta]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary || {};
  const findings = useMemo(() => {
    if (!data || !summary.despachos) return [];
    const light = (data.weights || [])
      .filter((x) => ['0-10 kg', '11-25 kg'].includes(x.tramo_peso))
      .reduce((sum, x) => sum + Number(x.porcentaje || 0), 0);
    const main = data.carriers?.[0];
    const topDestination = data.destinations?.[0];
    const result = [];
    if (light)
      result.push(`${number(light, 1)}% de los despachos con peso válido no supera 25 kg.`);
    if (main)
      result.push(
        `${main.transportista} concentra ${number(main.porcentaje, 1)}% de los despachos y mueve ${number(main.kilos, 1)} kg.`
      );
    if (topDestination)
      result.push(
        `${topDestination.destino} lidera por frecuencia con ${number(topDestination.despachos)} despachos y ${number(topDestination.kilos, 1)} kg.`
      );
    const weightCoverage = percentage(data.quality?.fletes_con_peso, data.quality?.fletes_total);
    if (weightCoverage < 90)
      result.push(
        `La cobertura de peso es ${number(weightCoverage, 1)}%; las conclusiones de capacidad deben leerse con esa limitación.`
      );
    result.push(
      'No es posible estimar ocupación volumétrica sin largo, ancho y alto de los bultos.'
    );
    return result.slice(0, 5);
  }, [data, summary.despachos]);

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImporting(true);
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
        defval: null,
        raw: true
      });
      const normalized = normalizeFreightRows(rows);
      if (!normalized.length)
        throw new Error('No se detectaron filas con N.V., factura o cliente.');
      const result = { total: 0, insertados: 0, actualizados: 0, errores: 0 };
      for (let i = 0; i < normalized.length; i += 500) {
        const part = await routeCoordinationService.importFreights(normalized.slice(i, i + 500));
        Object.keys(result).forEach((key) => {
          result[key] += Number(part?.[key] || 0);
        });
      }
      toast.success(
        `${result.insertados} fletes nuevos · ${result.actualizados} actualizados · ${result.errores} omitidos.`
      );
      await load();
    } catch (error) {
      toast.error(error.message || 'No fue posible importar el archivo.');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([FREIGHT_TEMPLATE_HEADERS]), 'Fletes');
    XLSX.writeFile(wb, 'plantilla-historico-fletes-ptm.xlsx');
  };

  if (loading && !data)
    return (
      <div className="cra-loading">
        <RefreshCw className="cr-spin" /> Consolidando histórico de despachos…
      </div>
    );

  const noData = !summary.despachos;
  const timeline = data?.timeline?.[grain] || [];
  const mainCarrier = data?.carriers?.[0];
  const topDestination = data?.destinations?.[0];
  const lightShare = (data?.weights || [])
    .filter((x) => ['0-10 kg', '11-25 kg'].includes(x.tramo_peso))
    .reduce((sum, x) => sum + Number(x.porcentaje || 0), 0);

  return (
    <div className="cra-shell">
      <section className="cra-toolbar cr-card">
        <div>
          <span className="cr-kicker">HISTÓRICO DE DESPACHOS — PTM</span>
          <h2>Diagnóstico ejecutivo logístico</h2>
          <p>Frecuencia, destinos, proveedores y perfil real de peso.</p>
        </div>
        <div className="cra-toolbar__actions">
          <label>
            <span>Desde</span>
            <input
              type="date"
              value={range.desde}
              onChange={(e) => setRange({ ...range, desde: e.target.value })}
            />
          </label>
          <label>
            <span>Hasta</span>
            <input
              type="date"
              value={range.hasta}
              onChange={(e) => setRange({ ...range, hasta: e.target.value })}
            />
          </label>
          <button className="cr-button cr-button--soft" onClick={load}>
            <RefreshCw size={15} /> Aplicar
          </button>
          <button
            className="cr-button cr-button--dark"
            disabled={noData}
            onClick={() => exportRouteAnalyticsPdf(data, findings)}
          >
            <Download size={15} /> PDF
          </button>
          <button
            className="cr-button cr-button--soft"
            disabled={noData}
            onClick={() => exportRouteAnalyticsExcel(data)}
          >
            <FileSpreadsheet size={15} /> Excel
          </button>
        </div>
      </section>

      <section className="cra-metrics">
        <Metric
          icon={Truck}
          label="Despachos"
          value={number(summary.despachos)}
          helper={`${summary.desde || '—'} → ${summary.hasta || '—'}`}
        />
        <Metric
          icon={Package}
          label="Bultos"
          value={number(summary.bultos)}
          helper={`${number(summary.bultos_despacho, 1)} por despacho`}
          tone="orange"
        />
        <Metric
          icon={Scale}
          label="Kilos válidos"
          value={`${number(summary.kilos, 1)} kg`}
          helper={`${number(summary.kg_despacho, 1)} kg por despacho`}
          tone="green"
        />
        <Metric
          icon={MapPin}
          label="Destino informado"
          value={`${number(percentage(data?.quality?.fletes_con_destino, data?.quality?.fletes_total), 1)}%`}
          helper="Cobertura geográfica"
          tone="purple"
        />
      </section>

      {noData && (
        <section className="cra-empty-state cr-card">
          <FileSpreadsheet size={34} />
          <div>
            <h3>Carga la base histórica de fletes</h3>
            <p>
              La operación actual tiene {number(data?.quality?.operaciones_total)} N.V. y{' '}
              {number(data?.quality?.operaciones_bultos)} bultos, pero los kilos históricos aún no
              están guardados en Supabase.
            </p>
          </div>
          <button className="cr-button cr-button--soft" onClick={downloadTemplate}>
            <Download size={15} /> Plantilla
          </button>
          <button
            className="cr-button cr-button--orange"
            onClick={() => inputRef.current?.click()}
            disabled={importing}
          >
            <Upload size={15} /> {importing ? 'Importando…' : 'Importar fletes'}
          </button>
        </section>
      )}

      <section className="cra-questions">
        <Question
          number="01"
          title="¿Cuánto despachamos?"
          answer={`${number(summary.despachos)} despachos · ${number(summary.bultos)} bultos · ${number(summary.kilos, 1)} kg`}
        >
          <p>Disponible por día, semana y mes según el selector inferior.</p>
        </Question>
        <Question
          number="02"
          title="¿Hacia dónde despachamos?"
          answer={
            topDestination
              ? `${topDestination.destino} es el principal destino`
              : 'Pendiente de datos de destino'
          }
        >
          <p>
            {topDestination
              ? `${number(topDestination.despachos)} despachos · ${number(topDestination.kilos, 1)} kg`
              : 'Importa comuna, ciudad o destino.'}
          </p>
        </Question>
        <Question
          number="03"
          title="¿Quién transporta?"
          answer={
            mainCarrier
              ? `${mainCarrier.transportista}: ${number(mainCarrier.porcentaje, 1)}%`
              : 'Pendiente de transportista'
          }
        >
          <p>
            {mainCarrier
              ? `${number(mainCarrier.despachos)} despachos · ${number(mainCarrier.kilos, 1)} kg · ${number(mainCarrier.kg_despacho, 1)} kg/despacho`
              : 'Sin datos suficientes.'}
          </p>
        </Question>
        <Question
          number="04"
          title="¿Qué tipo de carga movemos?"
          answer={
            lightShare ? `${number(lightShare, 1)}% pesa hasta 25 kg` : 'Pendiente de pesos válidos'
          }
        >
          <p>Segmentación exclusiva por peso; no se infiere volumen.</p>
        </Question>
      </section>

      <section className="cra-grid">
        <article className="cr-card cra-chart-card">
          <div className="cr-card__head">
            <div>
              <span className="cr-kicker">RITMO OPERACIONAL</span>
              <h3>N.V., bultos y kilos</h3>
            </div>
            <div className="cra-grain">
              {['day', 'week', 'month'].map((x) => (
                <button
                  key={x}
                  className={grain === x ? 'is-active' : ''}
                  onClick={() => setGrain(x)}
                >
                  {x === 'day' ? 'Día' : x === 'week' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="despachos" fill="#f97316" name="Despachos" radius={[5, 5, 0, 0]} />
              <Bar dataKey="kilos" fill="#0f766e" name="Kilos" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="cr-card">
          <div className="cr-card__head">
            <div>
              <span className="cr-kicker">PERFIL DE CARGA</span>
              <h3>Distribución por peso</h3>
            </div>
            <Scale size={20} />
          </div>
          <div className="cra-weight-list">
            {(data?.weights || []).map((row) => (
              <div key={row.tramo_peso}>
                <div>
                  <strong>{row.tramo_peso}</strong>
                  <span>
                    {number(row.despachos)} despachos · {number(row.kilos, 1)} kg
                  </span>
                </div>
                <b>{number(row.porcentaje, 1)}%</b>
                <i>
                  <span style={{ width: `${row.porcentaje}%` }} />
                </i>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="cra-grid">
        <article className="cr-card cra-table-card">
          <div className="cr-card__head">
            <div>
              <span className="cr-kicker">DEPENDENCIA</span>
              <h3>Transportistas</h3>
            </div>
            <Truck size={20} />
          </div>
          <div className="cra-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Transportista</th>
                  <th>Desp.</th>
                  <th>%</th>
                  <th>Bultos</th>
                  <th>Kilos</th>
                  <th>Kg/desp.</th>
                  <th>Destinos principales</th>
                </tr>
              </thead>
              <tbody>
                {(data?.carriers || []).map((x) => (
                  <tr key={x.transportista}>
                    <td>
                      <strong>{x.transportista}</strong>
                      <small>{x.tipo_transporte?.replaceAll('_', ' ')}</small>
                    </td>
                    <td>{number(x.despachos)}</td>
                    <td>{number(x.porcentaje, 1)}%</td>
                    <td>{number(x.bultos)}</td>
                    <td>{number(x.kilos, 1)}</td>
                    <td>{number(x.kg_despacho, 1)}</td>
                    <td>{x.principales_destinos?.join(' · ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article className="cr-card cra-table-card">
          <div className="cr-card__head">
            <div>
              <span className="cr-kicker">CONCENTRACIÓN GEOGRÁFICA</span>
              <h3>Destinos por frecuencia y kilos</h3>
            </div>
            <MapPin size={20} />
          </div>
          <div className="cra-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Destino</th>
                  <th>Desp.</th>
                  <th>Bultos</th>
                  <th>Kilos</th>
                </tr>
              </thead>
              <tbody>
                {(data?.destinations || []).slice(0, 12).map((x) => (
                  <tr key={x.destino}>
                    <td>
                      <strong>{x.destino}</strong>
                      <small>{x.region || 'Región sin validar'}</small>
                    </td>
                    <td>{number(x.despachos)}</td>
                    <td>{number(x.bultos)}</td>
                    <td>{number(x.kilos, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="cra-findings cr-card">
        <div>
          <span className="cr-kicker">LECTURA EJECUTIVA</span>
          <h3>Hallazgos prioritarios</h3>
          {findings.map((item, index) => (
            <p key={item}>
              <b>{index + 1}</b>
              {item}
            </p>
          ))}
        </div>
        <aside>
          <AlertTriangle size={22} />
          <strong>Peso ≠ volumen</strong>
          <p>
            No se puede determinar todavía la utilización volumétrica de la camioneta. Un despacho
            de 30 kg podría ocupar 0,2 m³ o 2 m³.
          </p>
          <span>Fase 2: capturar largo × ancho × alto y calcular m³ desde ahora.</span>
        </aside>
      </section>

      <section className="cra-import cr-card">
        <div>
          <ShieldCheck size={20} />
          <div>
            <span className="cr-kicker">FUENTE PRIVADA Y AUDITADA</span>
            <h3>Actualizar histórico de fletes</h3>
            <p>
              Acepta Excel/CSV, evita duplicados y solo el propietario del piloto puede ejecutar la
              carga.
            </p>
          </div>
        </div>
        <button className="cr-button cr-button--soft" onClick={downloadTemplate}>
          <Download size={15} /> Descargar plantilla
        </button>
        <button
          className="cr-button cr-button--orange"
          onClick={() => inputRef.current?.click()}
          disabled={importing}
        >
          <Upload size={15} /> {importing ? 'Procesando…' : 'Importar archivo'}
        </button>
        <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={upload} />
      </section>
    </div>
  );
}
