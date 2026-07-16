/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import {
  DATA_SOURCES, WIDGET_TYPES, getDefaultColor,
  fieldsForSource, FILTER_OPS,
} from "../widget-registry";

function ConfigPanel({ widget, onSave, onCancel, calcFields = [] }) {
  const [cfg, setCfg] = useState(() => JSON.parse(JSON.stringify(widget)));
  const baseDs = DATA_SOURCES.find((d) => d.key === cfg.dataSource);
  // `ds` con campos calculados fusionados (para la fuente "operaciones").
  const ds = baseDs ? { ...baseDs, fields: fieldsForSource(cfg.dataSource, calcFields) } : undefined;
  const dsType = ds?.type || "single";

  const update = (patch) => setCfg((prev) => ({ ...prev, ...patch }));
  const updateCfg = (patch) =>
    setCfg((prev) => ({ ...prev, config: { ...prev.config, ...patch } }));

  const addYField = () => {
    const fields = [...(cfg.config.yFields || [])];
    const idx = fields.length;
    fields.push({ key: "", label: "", color: getDefaultColor(idx) });
    updateCfg({ yFields: fields });
  };
  const removeYField = (i) => {
    const fields = [...(cfg.config.yFields || [])];
    fields.splice(i, 1);
    updateCfg({ yFields: fields });
  };
  const updateYField = (i, patch) => {
    const fields = [...(cfg.config.yFields || [])];
    fields[i] = { ...fields[i], ...patch };
    updateCfg({ yFields: fields });
  };

  const addColumn = () => {
    const cols = [...(cfg.config.columns || [])];
    cols.push({ key: "", label: "" });
    updateCfg({ columns: cols });
  };
  const removeColumn = (i) => {
    const cols = [...(cfg.config.columns || [])];
    cols.splice(i, 1);
    updateCfg({ columns: cols });
  };
  const updateColumn = (i, patch) => {
    const cols = [...(cfg.config.columns || [])];
    cols[i] = { ...cols[i], ...patch };
    updateCfg({ columns: cols });
  };

  // Filtros (S3)
  const addFilter = () => updateCfg({ filters: [...(cfg.config.filters || []), { field: "", op: "=", value: "" }] });
  const removeFilter = (i) => { const a = [...(cfg.config.filters || [])]; a.splice(i, 1); updateCfg({ filters: a }); };
  const updateFilter = (i, patch) => {
    const a = [...(cfg.config.filters || [])]; a[i] = { ...a[i], ...patch }; updateCfg({ filters: a });
  };

  const isChart = ["bar-chart", "line-chart", "area-chart"].includes(cfg.type);
  const isPieDonut = ["pie-chart", "donut-chart"].includes(cfg.type);
  const isTable = cfg.type === "table";
  const isStatList = cfg.type === "stat-list";
  const isHBars = cfg.type === "horizontal-bars";
  const isGauge = cfg.type === "gauge";
  const isHeatmap = cfg.type === "heatmap";
  const isSemaforo = cfg.type === "semaforo";
  const isScorecard = cfg.type === "scorecard";
  const isText = cfg.type === "text";
  const isImage = cfg.type === "image";
  const isDivider = cfg.type === "divider";
  const isLabelValue = ["horizontal-bars", "funnel", "timeline"].includes(cfg.type);
  const isDecorative = isText || isImage || isDivider;

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-start justify-end" onClick={onCancel}>
      <div className="w-[400px] max-w-full h-full bg-white shadow-xl overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10">
          <h2 className="font-bold text-gray-800">Configurar Widget</h2>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={() => onSave(cfg)} className="px-3 py-1.5 text-sm bg-[#f57c00] text-white rounded-lg hover:bg-[#e65100] font-medium">Guardar</button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Titulo */}
          <div>
            <label className="field-label">Titulo</label>
            <input className="field-input" value={cfg.title} onChange={(e) => update({ title: e.target.value })} />
          </div>

          {/* Tipo */}
          <div>
            <label className="field-label">Tipo de Widget</label>
            <select className="field-input" value={cfg.type} onChange={(e) => update({ type: e.target.value })}>
              {WIDGET_TYPES.map((wt) => (
                <option key={wt.type} value={wt.type}>{wt.label}</option>
              ))}
            </select>
          </div>

          {/* Fuente de datos */}
          <div>
            <label className="field-label">Fuente de Datos</label>
            <select className="field-input" value={cfg.dataSource} onChange={(e) => update({ dataSource: e.target.value })}>
              {DATA_SOURCES.map((d) => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
            {ds && <p className="text-[10px] text-gray-400 mt-1">Tipo: {ds.type} | Campos: {ds.fields.map(f => f.key).join(", ")}</p>}
          </div>

          {/* KPI sobre fuente "operaciones" (array): agregación de filas */}
          {cfg.type === "kpi" && dsType === "array" && (
            <>
              <div>
                <label className="field-label">Agregación</label>
                <select className="field-input" value={cfg.config.agg || "count"} onChange={(e) => updateCfg({ agg: e.target.value })}>
                  <option value="count">Contar filas (COUNT)</option>
                  <option value="sum">Sumar campo (SUM)</option>
                  <option value="avg">Promediar campo (AVG)</option>
                </select>
              </div>
              {(cfg.config.agg || "count") === "count" ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="field-label">Filtrar por campo (opcional)</label>
                    <select className="field-input" value={cfg.config.whereField || ""} onChange={(e) => updateCfg({ whereField: e.target.value })}>
                      <option value="">— todas —</option>
                      {ds?.fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Igual a</label>
                    <input className="field-input" value={cfg.config.whereValue || ""} onChange={(e) => updateCfg({ whereValue: e.target.value })} placeholder="Ej: CRITICA / true" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="field-label">Campo a {cfg.config.agg === "avg" ? "promediar" : "sumar"}</label>
                  <select className="field-input" value={cfg.config.valueField || ""} onChange={(e) => updateCfg({ valueField: e.target.value })}>
                    <option value="">-- seleccionar --</option>
                    {ds?.fields.filter(f => f.type === "number" || f.type === "percent").map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="field-label">Icono (emoji)</label>
                <input className="field-input" value={cfg.config.icon || ""} onChange={(e) => updateCfg({ icon: e.target.value })} placeholder="Ej: 🚨" />
              </div>
              <div>
                <label className="field-label">Subtitulo</label>
                <input className="field-input" value={cfg.config.subtitle || ""} onChange={(e) => updateCfg({ subtitle: e.target.value })} />
              </div>
            </>
          )}

          {/* KPI: campo de valor + formato (fuentes single/objeto) */}
          {cfg.type === "kpi" && dsType !== "array" && (
            <>
              <div>
                <label className="field-label">Campo de Valor</label>
                <select className="field-input" value={cfg.config.valueField || ""} onChange={(e) => updateCfg({ valueField: e.target.value })}>
                  <option value="">-- seleccionar --</option>
                  {ds?.fields.map((f) => <option key={f.key} value={f.key}>{f.label} ({f.key})</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Formato</label>
                <select className="field-input" value={cfg.config.format || "number"} onChange={(e) => updateCfg({ format: e.target.value })}>
                  <option value="number">Numero</option>
                  <option value="percent">Porcentaje (%)</option>
                  <option value="days">Dias (d)</option>
                  <option value="text">Texto</option>
                </select>
              </div>
              <div>
                <label className="field-label">Icono (emoji)</label>
                <input className="field-input" value={cfg.config.icon || ""} onChange={(e) => updateCfg({ icon: e.target.value })} placeholder="Ej: 📦" />
              </div>
              <div>
                <label className="field-label">Subtitulo</label>
                <input className="field-input" value={cfg.config.subtitle || ""} onChange={(e) => updateCfg({ subtitle: e.target.value })} />
              </div>
            </>
          )}

          {/* Charts: xField + yFields */}
          {(isChart) && dsType === "array" && (
            <>
              <div>
                <label className="field-label">Campo eje X</label>
                <select className="field-input" value={cfg.config.xField || ""} onChange={(e) => updateCfg({ xField: e.target.value })}>
                  <option value="">-- seleccionar --</option>
                  {ds?.fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Series (eje Y)</label>
                {(cfg.config.yFields || []).map((yf, i) => (
                  <div key={i} className="flex gap-2 mt-2 items-end">
                    <div className="flex-1">
                      <select className="field-input text-[12px]" value={yf.key} onChange={(e) => updateYField(i, { key: e.target.value, label: e.target.value })}>
                        <option value="">campo</option>
                        {ds?.fields.filter(f => f.type === "number" || f.type === "percent").map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                      </select>
                    </div>
                    <input className="w-16 field-input text-[12px]" value={yf.label} onChange={(e) => updateYField(i, { label: e.target.value })} placeholder="Label" />
                    <input type="color" className="w-8 h-9 rounded cursor-pointer" value={yf.color} onChange={(e) => updateYField(i, { color: e.target.value })} />
                    <button onClick={() => removeYField(i)} className="text-red-400 hover:text-red-600 text-sm px-1">X</button>
                  </div>
                ))}
                <button onClick={addYField} className="mt-2 text-[12px] text-blue-600 hover:text-blue-800">+ Agregar serie</button>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={cfg.config.showLegend !== false} onChange={(e) => updateCfg({ showLegend: e.target.checked })} />
                <span className="text-[12px] text-gray-600">Mostrar leyenda</span>
              </div>
            </>
          )}

          {/* Pie/Donut: labelField + valueField */}
          {isPieDonut && dsType === "array" && (
            <>
              <div>
                <label className="field-label">Campo de Etiqueta</label>
                <select className="field-input" value={cfg.config.labelField || cfg.config.xField || ""} onChange={(e) => updateCfg({ labelField: e.target.value })}>
                  <option value="">-- seleccionar --</option>
                  {ds?.fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Campo de Valor</label>
                <select className="field-input" value={cfg.config.valueField || ""} onChange={(e) => updateCfg({ valueField: e.target.value })}>
                  <option value="">-- seleccionar --</option>
                  {ds?.fields.filter(f => f.type === "number").map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Table: columns */}
          {isTable && (
            <div>
              <label className="field-label">Columnas</label>
              {(cfg.config.columns || []).map((col, i) => (
                <div key={i} className="flex gap-2 mt-2 items-end">
                  <div className="flex-1">
                    <select className="field-input text-[12px]" value={col.key} onChange={(e) => updateColumn(i, { key: e.target.value })}>
                      <option value="">campo</option>
                      {ds?.fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                  </div>
                  <input className="w-24 field-input text-[12px]" value={col.label} onChange={(e) => updateColumn(i, { label: e.target.value })} placeholder="Encabezado" />
                  <button onClick={() => removeColumn(i)} className="text-red-400 hover:text-red-600 text-sm px-1">X</button>
                </div>
              ))}
              <button onClick={addColumn} className="mt-2 text-[12px] text-blue-600 hover:text-blue-800">+ Agregar columna</button>
            </div>
          )}

          {/* Filtros (S3): solo fuentes array (operaciones). AND entre todos. */}
          {dsType === "array" && (
            <div className="border-t border-gray-100 pt-3 mt-1">
              <label className="field-label">Filtros <span className="text-gray-400 font-normal">(deben cumplirse todos)</span></label>
              {(cfg.config.filters || []).map((f, i) => (
                <div key={i} className="flex gap-1.5 mt-2 items-center">
                  <select className="field-input text-[12px] flex-1" value={f.field} onChange={(e) => updateFilter(i, { field: e.target.value })}>
                    <option value="">campo…</option>
                    {ds?.fields.map((fl) => <option key={fl.key} value={fl.key}>{fl.label}</option>)}
                  </select>
                  <select className="field-input text-[12px] w-20" value={f.op} onChange={(e) => updateFilter(i, { op: e.target.value })}>
                    {FILTER_OPS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                  <input className="field-input text-[12px] w-24" value={f.value} onChange={(e) => updateFilter(i, { value: e.target.value })} placeholder="valor" />
                  <button onClick={() => removeFilter(i)} className="text-red-400 hover:text-red-600 text-sm px-1">X</button>
                </div>
              ))}
              <button onClick={addFilter} className="mt-2 text-[12px] text-blue-600 hover:text-blue-800">+ Agregar filtro</button>
              <p className="text-[10px] text-gray-400 mt-1">Ej: prioridad = CRITICA · riesgo_otif = RIESGO · horas_restantes &lt; 12</p>
            </div>
          )}

          {/* Horizontal bars / funnel / timeline / stat-list: labelField + valueField */}
          {(isHBars || isLabelValue || isStatList) && dsType === "array" && (
            <>
              <div>
                <label className="field-label">Campo de Etiqueta</label>
                <select className="field-input" value={cfg.config.labelField || cfg.config.xField || ""} onChange={(e) => updateCfg({ labelField: e.target.value })}>
                  <option value="">-- seleccionar --</option>
                  {ds?.fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Campo de Valor</label>
                <select className="field-input" value={cfg.config.valueField || ""} onChange={(e) => updateCfg({ valueField: e.target.value })}>
                  <option value="">-- seleccionar --</option>
                  {ds?.fields.filter(f => f.type !== "string").map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Gauge: valueField + min/max */}
          {isGauge && (
            <>
              <div>
                <label className="field-label">Campo de Valor</label>
                <select className="field-input" value={cfg.config.valueField || ""} onChange={(e) => updateCfg({ valueField: e.target.value })}>
                  <option value="">-- seleccionar --</option>
                  {ds?.fields.filter(f => f.type === "number" || f.type === "percent").map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="field-label">Min</label>
                  <input type="number" className="field-input" value={cfg.config.min ?? 0} onChange={(e) => updateCfg({ min: Number(e.target.value) })} />
                </div>
                <div className="flex-1">
                  <label className="field-label">Max</label>
                  <input type="number" className="field-input" value={cfg.config.max ?? 100} onChange={(e) => updateCfg({ max: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="field-label">Subtitulo</label>
                <input className="field-input" value={cfg.config.subtitle || ""} onChange={(e) => updateCfg({ subtitle: e.target.value })} />
              </div>
            </>
          )}

          {/* Semáforo: valor + umbrales + tendencia (MEJORANDO) */}
          {isSemaforo && (
            <>
              <div>
                <label className="field-label">Campo de Valor</label>
                <select className="field-input" value={cfg.config.valueField || ""} onChange={(e) => updateCfg({ valueField: e.target.value })}>
                  <option value="">-- seleccionar --</option>
                  {ds?.fields.filter(f => f.type === "number" || f.type === "percent").map((f) => <option key={f.key} value={f.key}>{f.label} ({f.key})</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Formato</label>
                <select className="field-input" value={cfg.config.format || "percent"} onChange={(e) => updateCfg({ format: e.target.value })}>
                  <option value="percent">Porcentaje (%)</option>
                  <option value="number">Numero</option>
                  <option value="days">Dias (d)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={cfg.config.higherIsBetter !== false} onChange={(e) => updateCfg({ higherIsBetter: e.target.checked })} />
                <span className="text-[12px] text-gray-600">Más alto es mejor (desmarca para lead time / tardanza)</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="field-label">Umbral OK ({cfg.config.higherIsBetter !== false ? "≥ verde" : "≤ verde"})</label>
                  <input type="number" className="field-input" value={cfg.config.okThreshold ?? ""} onChange={(e) => updateCfg({ okThreshold: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder={cfg.config.higherIsBetter !== false ? "85" : "1"} />
                </div>
                <div className="flex-1">
                  <label className="field-label">Umbral Crítico ({cfg.config.higherIsBetter !== false ? "< rojo" : "> rojo"})</label>
                  <input type="number" className="field-input" value={cfg.config.critThreshold ?? ""} onChange={(e) => updateCfg({ critThreshold: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder={cfg.config.higherIsBetter !== false ? "50" : "5"} />
                </div>
              </div>
              <div>
                <label className="field-label">Campo de tendencia (para &ldquo;Mejorando&rdquo;)</label>
                <select className="field-input" value={cfg.config.trendField || ""} onChange={(e) => updateCfg({ trendField: e.target.value || undefined })}>
                  <option value="">— Sin tendencia —</option>
                  <option value="pctATiempo">% A Tiempo (mensual)</option>
                  <option value="otif">OTIF (mensual)</option>
                  <option value="leadTime">Lead Time (mensual)</option>
                  <option value="entregadas">Entregadas (mensual)</option>
                  <option value="activas">Activas (mensual)</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Compara el último mes vs el anterior (fuente: Tendencia Histórica). Si mejoró → azul &ldquo;Mejorando&rdquo;.</p>
              </div>
              <div>
                <label className="field-label">Subtitulo</label>
                <input className="field-input" value={cfg.config.subtitle || ""} onChange={(e) => updateCfg({ subtitle: e.target.value })} />
              </div>
            </>
          )}

          {/* Heatmap: rowField + colField + valueField */}
          {isHeatmap && (
            <>
              <div>
                <label className="field-label">Campo de Filas</label>
                <select className="field-input" value={cfg.config.rowField || ""} onChange={(e) => updateCfg({ rowField: e.target.value })}>
                  <option value="">-- seleccionar --</option>
                  {ds?.fields.filter(f => f.type === "string").map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Campo de Columnas</label>
                <select className="field-input" value={cfg.config.colField || ""} onChange={(e) => updateCfg({ colField: e.target.value })}>
                  <option value="">-- seleccionar --</option>
                  {ds?.fields.filter(f => f.type === "string").map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Campo de Valor</label>
                <select className="field-input" value={cfg.config.valueField || ""} onChange={(e) => updateCfg({ valueField: e.target.value })}>
                  <option value="">-- seleccionar --</option>
                  {ds?.fields.filter(f => f.type === "number").map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
            </>
          )}

          {/* stat-list for single data: columns act as field list */}
          {isStatList && dsType === "single" && (
            <div>
              <label className="field-label">Campos a mostrar</label>
              {(cfg.config.columns || []).map((col, i) => (
                <div key={i} className="flex gap-2 mt-2 items-end">
                  <div className="flex-1">
                    <select className="field-input text-[12px]" value={col.key} onChange={(e) => updateColumn(i, { key: e.target.value })}>
                      <option value="">campo</option>
                      {ds?.fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                  </div>
                  <input className="w-24 field-input text-[12px]" value={col.label} onChange={(e) => updateColumn(i, { label: e.target.value })} placeholder="Etiqueta" />
                  <button onClick={() => removeColumn(i)} className="text-red-400 hover:text-red-600 text-sm px-1">X</button>
                </div>
              ))}
              <button onClick={addColumn} className="mt-2 text-[12px] text-blue-600 hover:text-blue-800">+ Agregar campo</button>
            </div>
          )}

          {/* Scorecard */}
          {isScorecard && (
            <>
              <div>
                <label className="field-label">Campo de Valor</label>
                <select className="field-input" value={cfg.config.valueField || ""} onChange={(e) => updateCfg({ valueField: e.target.value })}>
                  <option value="">-- seleccionar --</option>
                  {ds?.fields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Formato</label>
                <select className="field-input" value={cfg.config.format || "number"} onChange={(e) => updateCfg({ format: e.target.value })}>
                  <option value="number">Número</option>
                  <option value="percent">Porcentaje (%)</option>
                  <option value="days">Días (d)</option>
                </select>
              </div>
              <div>
                <label className="field-label">Campo de comparación</label>
                <select className="field-input" value={cfg.config.comparisonField || ""} onChange={(e) => updateCfg({ comparisonField: e.target.value || undefined })}>
                  <option value="">— Sin comparación —</option>
                  {ds?.fields.filter(f => f.type !== "string").map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
              {cfg.config.comparisonField && (
                <>
                  <div>
                    <label className="field-label">Label comparación</label>
                    <input className="field-input" value={cfg.config.comparisonLabel || ""} onChange={(e) => updateCfg({ comparisonLabel: e.target.value })} placeholder="vs mes anterior" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={!!cfg.config.invertComparison} onChange={(e) => updateCfg({ invertComparison: e.target.checked })} />
                    <span className="text-[12px] text-gray-600">Invertir (menos es mejor)</span>
                  </div>
                </>
              )}
              <div>
                <label className="field-label">Prefijo</label>
                <input className="field-input" value={cfg.config.prefix || ""} onChange={(e) => updateCfg({ prefix: e.target.value })} placeholder="$, CLP, etc." />
              </div>
              <div>
                <label className="field-label">Sufijo</label>
                <input className="field-input" value={cfg.config.suffix || ""} onChange={(e) => updateCfg({ suffix: e.target.value })} placeholder="%, unid, etc." />
              </div>
              <div>
                <label className="field-label">Subtitulo</label>
                <input className="field-input" value={cfg.config.subtitle || ""} onChange={(e) => updateCfg({ subtitle: e.target.value })} />
              </div>
            </>
          )}

          {/* Texto libre */}
          {isText && (
            <>
              <div>
                <label className="field-label">Contenido</label>
                <textarea className="field-input min-h-[80px]" value={cfg.config.content || ""} onChange={(e) => updateCfg({ content: e.target.value })} placeholder="Escribe tu texto aquí…" />
              </div>
            </>
          )}

          {/* Imagen */}
          {isImage && (
            <>
              <div>
                <label className="field-label">URL de imagen</label>
                <input className="field-input" value={cfg.config.imageUrl || ""} onChange={(e) => updateCfg({ imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="field-label">Ajuste</label>
                <select className="field-input" value={cfg.config.imageFit || "contain"} onChange={(e) => updateCfg({ imageFit: e.target.value })}>
                  <option value="contain">Contener</option>
                  <option value="cover">Cubrir</option>
                  <option value="fill">Estirar</option>
                </select>
              </div>
            </>
          )}

          {/* Area chart: fillOpacity */}
          {cfg.type === "area-chart" && (
            <div>
              <label className="field-label">Opacidad relleno</label>
              <input type="range" min="0" max="1" step="0.05" className="w-full" value={cfg.config.fillOpacity ?? 0.3} onChange={(e) => updateCfg({ fillOpacity: Number(e.target.value) })} />
              <span className="text-[11px] text-gray-400">{(cfg.config.fillOpacity ?? 0.3).toFixed(2)}</span>
            </div>
          )}

          <hr className="border-gray-100" />
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Apariencia</p>

          {/* Comunes: color, maxItems */}
          <div>
            <label className="field-label">Color principal</label>
            <div className="flex items-center gap-2">
              <input type="color" className="w-10 h-9 rounded cursor-pointer" value={cfg.config.color || "#f57c00"} onChange={(e) => updateCfg({ color: e.target.value })} />
              <span className="text-[12px] text-gray-400">{cfg.config.color || "#f57c00"}</span>
            </div>
          </div>

          {/* Tamaño de fuente */}
          {(cfg.type === "kpi" || isScorecard || isText) && (
            <div>
              <label className="field-label">Tamaño fuente</label>
              <select className="field-input" value={cfg.config.fontSize || "md"} onChange={(e) => updateCfg({ fontSize: e.target.value })}>
                <option value="sm">Pequeño</option>
                <option value="md">Mediano</option>
                <option value="lg">Grande</option>
                <option value="xl">Extra grande</option>
              </select>
            </div>
          )}

          {/* Alineación */}
          {(cfg.type === "kpi" || isScorecard || isText) && (
            <div>
              <label className="field-label">Alineación</label>
              <div className="flex gap-1">
                {(["left", "center", "right"]).map(a => (
                  <button key={a} type="button"
                    onClick={() => updateCfg({ textAlign: a })}
                    className={`flex-1 py-1.5 rounded text-[11px] font-medium ${cfg.config.textAlign === a || (!cfg.config.textAlign && a === "center") ? "bg-orange-100 text-orange-700" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                    {a === "left" ? "Izq" : a === "center" ? "Centro" : "Der"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fondo, borde, radio */}
          {!isDivider && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="field-label">Fondo</label>
                <div className="flex items-center gap-1">
                  <input type="color" className="w-8 h-8 rounded cursor-pointer" value={cfg.config.bgColor || "#ffffff"} onChange={(e) => updateCfg({ bgColor: e.target.value })} />
                  <button className="text-[10px] text-gray-400 hover:text-gray-600" onClick={() => updateCfg({ bgColor: undefined })}>reset</button>
                </div>
              </div>
              <div className="flex-1">
                <label className="field-label">Borde</label>
                <div className="flex items-center gap-1">
                  <input type="color" className="w-8 h-8 rounded cursor-pointer" value={cfg.config.borderColor || "#e5e7eb"} onChange={(e) => updateCfg({ borderColor: e.target.value })} />
                  <input type="number" className="field-input w-14 text-[11px]" value={cfg.config.borderWidth ?? 1} onChange={(e) => updateCfg({ borderWidth: Number(e.target.value) })} min={0} max={8} />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="field-label">Radio bordes (px)</label>
            <input type="range" min="0" max="24" className="w-full" value={cfg.config.borderRadius ?? 12} onChange={(e) => updateCfg({ borderRadius: Number(e.target.value) })} />
            <span className="text-[11px] text-gray-400">{cfg.config.borderRadius ?? 12}px</span>
          </div>

          {dsType === "array" && !isDecorative && (
            <div>
              <label className="field-label">Items max</label>
              <input type="number" className="field-input" value={cfg.config.maxItems || ""} onChange={(e) => updateCfg({ maxItems: e.target.value ? Number(e.target.value) : undefined })} placeholder="Sin limite" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default ConfigPanel;
