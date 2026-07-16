/* eslint-disable @typescript-eslint/no-explicit-any */

import { memo } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";
import {
  resolveData, clasificarSemaforo, SEMAFORO_LEVELS, applyFilters,
} from "../widget-registry";
import { hexToRgbObj } from "../format";

// Color de badge por valor (semáforo) para campos calculados tipo "badge".
function badgeColors(v) {
  const s = String(v).toUpperCase();
  if (["CRITICA", "FAIL", "TRUE", "RIESGO", "RISK"].includes(s)) return { bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444" };
  if (["ALTA", "PEND", "MEDIA"].includes(s)) return { bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b" };
  if (["OK", "NORMAL", "FALSE", "FINALIZADA"].includes(s)) return { bg: "#f0fdf4", fg: "#15803d", dot: "#22c55e" };
  return { bg: "#f3f4f6", fg: "#374151", dot: "#9ca3af" };
}

const PALETTE = [
  "#f57c00", "#1565c0", "#2e7d32", "#c62828", "#6a1b9a",
  "#00838f", "#ef6c00", "#283593", "#558b2f", "#ad1457",
];

function WidgetRenderer({ widget, data, editMode, onEdit, onRemove }) {
  let resolved = resolveData(widget.dataSource, data);
  // Filtros (S3): se aplican a fuentes array (operaciones) antes de render/agregar.
  if (Array.isArray(resolved) && widget.config.filters?.length) {
    resolved = applyFilters(resolved, widget.config.filters);
  }

  const renderContent = () => {
    if (!resolved) {
      return <div className="flex items-center justify-center h-full text-gray-300 text-sm">Sin datos</div>;
    }

    switch (widget.type) {
      case "kpi": {
        const c = widget.config;
        let val;
        if (Array.isArray(resolved)) {
          // Agregación sobre filas (fuente "operaciones"): count / sum / avg.
          const agg = c.agg || "count";
          if (agg === "count") {
            if (c.whereField) {
              const target = String(c.whereValue ?? "").toLowerCase();
              val = resolved.filter((r) => String(r?.[c.whereField] ?? "").toLowerCase() === target).length;
            } else {
              val = resolved.length;
            }
          } else {
            const nums = resolved.map((r) => Number(r?.[c.valueField || ""])).filter((x) => !isNaN(x));
            if (agg === "sum") val = nums.reduce((s, x) => s + x, 0);
            else val = nums.length ? Math.round((nums.reduce((s, x) => s + x, 0) / nums.length) * 10) / 10 : 0;
          }
        } else {
          val = c.valueField ? resolved[c.valueField] : resolved;
        }
        const formatted = val == null ? "—"
          : widget.config.format === "percent" ? `${val}%`
          : widget.config.format === "days" ? `${val} d`
          : typeof val === "number" ? val.toLocaleString("es-CL")
          : String(val);
        return (
          <div className="flex flex-col items-center justify-center h-full gap-1">
            {widget.config.icon && <span className="text-2xl">{widget.config.icon}</span>}
            <span className="text-3xl font-bold" style={{ color: widget.config.color || "#f57c00" }}>
              {formatted}
            </span>
            {widget.config.subtitle && (
              <span className="text-[11px] text-gray-400 text-center">{widget.config.subtitle}</span>
            )}
          </div>
        );
      }

      case "semaforo": {
        const c = widget.config;
        const raw = c.valueField ? resolved[c.valueField] : resolved;
        const num = raw == null || raw === "" ? null : Number(raw);
        // MEJORANDO = tendencia: comparar último vs período anterior en `tendencia`.
        let prev = null;
        if (c.trendField && Array.isArray(data?.tendencia)) {
          const serie = data.tendencia
            .map((m) => m[c.trendField])
            .filter((v) => v != null && !isNaN(Number(v)))
            .map((v) => Number(v));
          if (serie.length >= 2) prev = serie[serie.length - 2];
        }
        const level = clasificarSemaforo(num, prev, {
          higherIsBetter: c.higherIsBetter,
          okThreshold: c.okThreshold,
          critThreshold: c.critThreshold,
        });
        const meta = level ? SEMAFORO_LEVELS[level] : null;
        const formatted = num == null ? "—"
          : c.format === "percent" ? `${num}%`
          : c.format === "days" ? `${num} d`
          : num.toLocaleString("es-CL");
        const flecha = prev == null || num == null ? "" : num > prev ? "▲" : num < prev ? "▼" : "▬";
        return (
          <div
            className="flex flex-col items-center justify-center h-full gap-1 rounded-lg"
            style={{ background: meta?.bg || "#f3f4f6" }}
          >
            <span className="text-4xl font-extrabold" style={{ color: meta?.color || "#9ca3af" }}>{formatted}</span>
            {meta && (
              <span className="text-[12px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white" style={{ background: meta.color }}>
                {meta.label}
              </span>
            )}
            {c.trendField && prev != null && (
              <span className="text-[11px] font-medium" style={{ color: meta?.color || "#6b7280" }}>
                {flecha} vs período anterior ({c.format === "percent" ? `${prev}%` : prev})
              </span>
            )}
            {c.subtitle && <span className="text-[11px] text-gray-500 text-center">{c.subtitle}</span>}
          </div>
        );
      }

      case "bar-chart": {
        const arr = Array.isArray(resolved) ? resolved : [];
        const yFields = widget.config.yFields || [];
        const xField = widget.config.xField || "label";
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={arr.slice(0, widget.config.maxItems || 50)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xField} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              {widget.config.showLegend !== false && <Legend wrapperStyle={{ fontSize: 11 }} />}
              {yFields.map((f) => (
                <Bar key={f.key} dataKey={f.key} name={f.label} fill={f.color} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case "line-chart": {
        const arr = Array.isArray(resolved) ? resolved : [];
        const yFields = widget.config.yFields || [];
        const xField = widget.config.xField || "label";
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={arr.slice(0, widget.config.maxItems || 50)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xField} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              {widget.config.showLegend !== false && <Legend wrapperStyle={{ fontSize: 11 }} />}
              {yFields.map((f) => (
                <Line key={f.key} type="monotone" dataKey={f.key} name={f.label} stroke={f.color} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      }

      case "pie-chart":
      case "donut-chart": {
        const arr = Array.isArray(resolved) ? resolved : [];
        const labelField = widget.config.labelField || widget.config.xField || "label";
        const valField = widget.config.valueField || (widget.config.yFields?.[0]?.key) || "total";
        const sliced = arr.slice(0, widget.config.maxItems || 10);
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sliced}
                dataKey={valField}
                nameKey={labelField}
                cx="50%" cy="50%"
                innerRadius={widget.type === "donut-chart" ? "40%" : 0}
                outerRadius="75%"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ strokeWidth: 1 }}
              >
                {sliced.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      case "table": {
        const arr = Array.isArray(resolved) ? resolved : [];
        const cols = widget.config.columns || [];
        const sliced = arr.slice(0, widget.config.maxItems || 20);
        // Campos calculados tipo badge → render con semáforo.
        const badgeKeys = new Set(
          (data?._calcFields || []).filter((c) => c.tipo === "badge").map((c) => c.nombre)
        );
        return (
          <div className="overflow-auto h-full">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr>
                  {cols.map((c) => (
                    <th key={c.key} className="sticky top-0 bg-[#f57c00] text-white px-2 py-1.5 text-left font-semibold text-[11px] uppercase tracking-wide">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sliced.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-orange-50/40">
                    {cols.map((c) => {
                      const val = row[c.key];
                      if (badgeKeys.has(c.key) && val != null && val !== "") {
                        const bc = badgeColors(val);
                        return (
                          <td key={c.key} className="px-2 py-1.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: bc.bg, color: bc.fg }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: bc.dot }} />
                              {String(val)}
                            </span>
                          </td>
                        );
                      }
                      return (
                        <td key={c.key} className="px-2 py-1.5">
                          {val != null ? (typeof val === "number" ? val.toLocaleString("es-CL") : String(val)) : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case "horizontal-bars": {
        const arr = Array.isArray(resolved) ? resolved : [];
        const labelField = widget.config.labelField || widget.config.xField || "nombre";
        const valField = widget.config.valueField || (widget.config.yFields?.[0]?.key) || "total";
        const barColor = widget.config.color || "#f57c00";
        const sliced = arr.slice(0, widget.config.maxItems || 10);
        const maxVal = Math.max(1, ...sliced.map((r) => Number(r[valField]) || 0));
        return (
          <div className="space-y-2 overflow-auto h-full pr-1">
            {sliced.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-28 shrink-0 text-[11px] text-gray-600 text-right truncate">{row[labelField]}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full rounded flex items-center justify-end pr-1.5 text-[10px] font-semibold text-white transition-all"
                    style={{ width: `${Math.max(6, ((Number(row[valField]) || 0) / maxVal) * 100)}%`, background: barColor }}
                  >
                    {row[valField] != null ? row[valField] : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      }

      case "stat-list": {
        if (Array.isArray(resolved)) {
          const labelField = widget.config.labelField || widget.config.xField || "nombre";
          const valField = widget.config.valueField || (widget.config.yFields?.[0]?.key) || "total";
          const sliced = resolved.slice(0, widget.config.maxItems || 10);
          return (
            <div className="space-y-1.5 overflow-auto h-full">
              {sliced.map((row, i) => (
                <div key={i} className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50">
                  <span className="text-[12px] text-gray-700">{row[labelField]}</span>
                  <span className="text-[13px] font-bold" style={{ color: widget.config.color || "#f57c00" }}>
                    {row[valField] != null ? (typeof row[valField] === "number" ? row[valField].toLocaleString("es-CL") : row[valField]) : "—"}
                  </span>
                </div>
              ))}
            </div>
          );
        }
        const fields = widget.config.columns || [];
        return (
          <div className="space-y-1.5 overflow-auto h-full">
            {fields.map((f) => (
              <div key={f.key} className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50">
                <span className="text-[12px] text-gray-700">{f.label}</span>
                <span className="text-[13px] font-bold" style={{ color: widget.config.color || "#f57c00" }}>
                  {resolved?.[f.key] != null ? resolved[f.key] : "—"}
                </span>
              </div>
            ))}
          </div>
        );
      }

      case "gauge": {
        const raw = widget.config.valueField ? resolved[widget.config.valueField] : resolved;
        const val = Number(raw);
        const min = widget.config.min ?? 0;
        const max = widget.config.max ?? 100;
        if (isNaN(val)) return <div className="flex items-center justify-center h-full text-gray-300 text-sm">Sin datos</div>;
        const pct = Math.max(0, Math.min(1, (val - min) / (max - min || 1)));
        const angle = pct * 180; // semicirculo
        const color = pct >= 0.8 ? "#2e7d32" : pct >= 0.5 ? "#f57c00" : "#c62828";
        // arco semicircular: radio 80, centro (100, 100)
        const r = 80;
        const a = (Math.PI * (180 - angle)) / 180;
        const x = 100 + r * Math.cos(a);
        const y = 100 - r * Math.sin(a);
        const largeArc = angle > 180 ? 1 : 0;
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <svg viewBox="0 0 200 120" className="w-full" style={{ maxHeight: "100%" }}>
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#eee" strokeWidth="14" strokeLinecap="round" />
              <path d={`M 20 100 A 80 80 0 ${largeArc} 1 ${x} ${y}`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
              <text x="100" y="92" textAnchor="middle" fontSize="30" fontWeight="bold" fill={color}>
                {widget.config.format === "percent" || max === 100 ? `${Math.round(val)}%` : Math.round(val)}
              </text>
            </svg>
            {widget.config.subtitle && <span className="text-[11px] text-gray-400 text-center -mt-1">{widget.config.subtitle}</span>}
          </div>
        );
      }

      case "funnel": {
        const arr = Array.isArray(resolved) ? resolved : [];
        const labelField = widget.config.labelField || "etapa";
        const valField = widget.config.valueField || "cantidad";
        const sliced = arr.slice(0, widget.config.maxItems || 10);
        const maxVal = Math.max(1, ...sliced.map((r) => Number(r[valField]) || 0));
        const baseColor = widget.config.color || "#f57c00";
        return (
          <div className="flex flex-col gap-1.5 h-full justify-center overflow-auto py-1">
            {sliced.map((row, i) => {
              const v = Number(row[valField]) || 0;
              const w = Math.max(15, (v / maxVal) * 100);
              const prev = i > 0 ? Number(sliced[i - 1][valField]) || 0 : v;
              const conv = prev > 0 ? Math.round((v / prev) * 100) : 100;
              return (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className="h-9 rounded flex items-center justify-center text-white text-[12px] font-semibold transition-all"
                    style={{ width: `${w}%`, background: baseColor, opacity: 1 - i * 0.13 }}
                  >
                    {row[labelField]}: {v.toLocaleString("es-CL")}
                  </div>
                  {i > 0 && <span className="text-[9px] text-gray-400">{conv}%</span>}
                </div>
              );
            })}
          </div>
        );
      }

      case "timeline": {
        const arr = Array.isArray(resolved) ? resolved : [];
        const labelField = widget.config.labelField || "label";
        const valField = widget.config.valueField || (widget.config.yFields?.[0]?.key) || "entregadas";
        const color = widget.config.color || "#f57c00";
        const sliced = arr.slice(0, widget.config.maxItems || 20);
        return (
          <div className="overflow-auto h-full pl-1">
            <div className="relative pl-4 border-l-2 border-gray-200 space-y-3 py-1">
              {sliced.map((row, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ background: color }} />
                  <div className="text-[12px] font-semibold text-gray-700">{row[labelField]}</div>
                  <div className="text-[13px] font-bold" style={{ color }}>
                    {row[valField] != null ? (typeof row[valField] === "number" ? row[valField].toLocaleString("es-CL") : row[valField]) : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "heatmap": {
        const arr = Array.isArray(resolved) ? resolved : [];
        const rowField = widget.config.rowField || "estado";
        const colField = widget.config.colField || "transportista";
        const valField = widget.config.valueField || "cantidad";
        const maxCols = widget.config.maxItems || 8;
        // pivot
        const rowKeys = [];
        const colTotals = {};
        const matrix = {};
        arr.forEach((r) => {
          const rk = String(r[rowField] ?? "—");
          const ck = String(r[colField] ?? "—");
          const v = Number(r[valField]) || 0;
          if (!rowKeys.includes(rk)) rowKeys.push(rk);
          if (!matrix[rk]) matrix[rk] = {};
          matrix[rk][ck] = (matrix[rk][ck] || 0) + v;
          colTotals[ck] = (colTotals[ck] || 0) + v;
        });
        const colKeys = Object.entries(colTotals).sort((a, b) => b[1] - a[1]).slice(0, maxCols).map(([k]) => k);
        let maxCell = 1;
        rowKeys.forEach((rk) => colKeys.forEach((ck) => { maxCell = Math.max(maxCell, matrix[rk]?.[ck] || 0); }));
        const base = widget.config.color || "#f57c00";
        const { r: br, g: bg, b: bb } = hexToRgbObj(base);
        return (
          <div className="overflow-auto h-full">
            <table className="border-collapse text-[10px]">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white px-1.5 py-1 text-left text-gray-400 font-medium"></th>
                  {colKeys.map((ck) => (
                    <th key={ck} className="px-1.5 py-1 text-gray-500 font-medium whitespace-nowrap" style={{ maxWidth: 70 }}>
                      <div className="truncate" style={{ maxWidth: 70 }} title={ck}>{ck}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowKeys.map((rk) => (
                  <tr key={rk}>
                    <td className="sticky left-0 bg-white px-1.5 py-1 text-gray-600 font-medium whitespace-nowrap">{rk}</td>
                    {colKeys.map((ck) => {
                      const v = matrix[rk]?.[ck] || 0;
                      const intensity = v / maxCell;
                      return (
                        <td key={ck} className="px-1.5 py-1 text-center font-semibold"
                          style={{
                            background: v > 0 ? `rgba(${br},${bg},${bb},${0.12 + intensity * 0.88})` : "#fafafa",
                            color: intensity > 0.55 ? "#fff" : "#444",
                          }}
                          title={`${rk} / ${ck}: ${v}`}
                        >
                          {v || ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case "area-chart": {
        const arr = Array.isArray(resolved) ? resolved : [];
        const yFields = widget.config.yFields || [];
        const xField = widget.config.xField || "label";
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={arr.slice(0, widget.config.maxItems || 50)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={xField} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              {widget.config.showLegend !== false && <Legend wrapperStyle={{ fontSize: 11 }} />}
              {yFields.map((f) => (
                <Area key={f.key} type="monotone" dataKey={f.key} name={f.label} stroke={f.color} fill={f.color} fillOpacity={widget.config.fillOpacity ?? 0.3} strokeWidth={2} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      }

      case "scorecard": {
        const c = widget.config;
        const raw = c.valueField ? resolved?.[c.valueField] : resolved;
        const num = raw == null ? null : Number(raw);
        const formatted = num == null ? "—"
          : c.format === "percent" ? `${(c.prefix || "")}${num}%${(c.suffix || "")}`
          : c.format === "days" ? `${(c.prefix || "")}${num} d${(c.suffix || "")}`
          : `${(c.prefix || "")}${num.toLocaleString("es-CL")}${(c.suffix || "")}`;
        let comp = null;
        if (c.comparisonField && resolved) comp = Number(resolved[c.comparisonField]);
        if (comp != null && isNaN(comp)) comp = null;
        const delta = num != null && comp != null && comp !== 0 ? ((num - comp) / Math.abs(comp)) * 100 : null;
        const deltaPositive = delta != null ? (c.invertComparison ? delta < 0 : delta > 0) : null;
        const fs = c.fontSize === "sm" ? "text-2xl" : c.fontSize === "lg" ? "text-5xl" : c.fontSize === "xl" ? "text-6xl" : "text-4xl";
        return (
          <div className={`flex flex-col items-${c.textAlign || "center"} justify-center h-full gap-1`}>
            <span className={`${fs} font-extrabold tabular-nums`} style={{ color: c.color || "#f57c00" }}>{formatted}</span>
            {delta != null && (
              <span className={`text-sm font-semibold ${deltaPositive ? "text-green-600" : "text-red-500"}`}>
                {delta > 0 ? "▲" : delta < 0 ? "▼" : "▬"} {Math.abs(delta).toFixed(1)}%
                {c.comparisonLabel && <span className="text-gray-400 font-normal ml-1">{c.comparisonLabel}</span>}
              </span>
            )}
            {c.subtitle && <span className="text-[11px] text-gray-400">{c.subtitle}</span>}
          </div>
        );
      }

      case "text": {
        const c = widget.config;
        const fs = c.fontSize === "sm" ? "text-sm" : c.fontSize === "lg" ? "text-xl" : c.fontSize === "xl" ? "text-2xl" : "text-base";
        return (
          <div className={`h-full flex items-center ${c.textAlign === "right" ? "justify-end" : c.textAlign === "left" ? "justify-start" : "justify-center"} p-2`}>
            <div className={`${fs} whitespace-pre-wrap`} style={{ color: c.color || "#374151" }}>{c.content || "Texto aquí…"}</div>
          </div>
        );
      }

      case "divider": {
        const c = widget.config;
        return (
          <div className="h-full flex items-center px-2">
            <div className="w-full" style={{ borderTop: `${c.borderWidth || 1}px solid ${c.borderColor || c.color || "#e5e7eb"}`, borderRadius: c.borderRadius ?? 0 }} />
          </div>
        );
      }

      case "image": {
        const c = widget.config;
        return (
          <div className="h-full w-full flex items-center justify-center overflow-hidden p-1">
            {c.imageUrl ? (
              <img src={c.imageUrl} alt={widget.title} className="max-h-full max-w-full" style={{ objectFit: c.imageFit || "contain" }} />
            ) : (
              <div className="text-gray-300 text-sm">Sin URL de imagen</div>
            )}
          </div>
        );
      }

      default:
        return <div className="text-gray-400 text-sm">Tipo desconocido</div>;
    }
  };

  const c = widget.config;
  const customBg = c.bgColor || undefined;
  const customBorder = c.borderColor || undefined;
  const customBorderW = c.borderWidth ?? undefined;
  const customRadius = c.borderRadius ?? 12;
  const isDecorative = ["text", "divider", "image"].includes(widget.type);

  return (
    <div
      className={`h-full flex flex-col overflow-hidden group relative ${isDecorative ? "" : "shadow-sm"}`}
      style={{
        background: customBg || "#fff",
        border: `${customBorderW ?? 1}px solid ${customBorder || "#e5e7eb"}`,
        borderRadius: customRadius,
      }}
    >
      {!isDecorative ? (
        <>
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 shrink-0 cursor-move drag-handle">
            <h3 className="text-[12px] font-semibold text-gray-600 uppercase tracking-wide truncate">{widget.title}</h3>
            {editMode && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 text-[12px]" title="Configurar">C</button>
                <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 text-[12px]" title="Eliminar">X</button>
              </div>
            )}
          </div>
          <div className="flex-1 p-3 overflow-hidden min-h-0">{renderContent()}</div>
        </>
      ) : (
        <>
          {editMode && (
            <div className="absolute top-1 right-1 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-6 h-6 rounded bg-white/80 flex items-center justify-center text-gray-400 hover:text-blue-600 text-[11px] shadow-sm" title="Configurar">C</button>
              <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="w-6 h-6 rounded bg-white/80 flex items-center justify-center text-gray-400 hover:text-red-600 text-[11px] shadow-sm" title="Eliminar">X</button>
            </div>
          )}
          <div className="flex-1 overflow-hidden min-h-0 drag-handle cursor-move">{renderContent()}</div>
        </>
      )}
    </div>
  );
}


// Comparador que ignora los callbacks (onEdit/onRemove son arrows inline que
// cierran sobre w.id estable). Al arrastrar o reconfigurar un widget, los demás
// no re-renderizan sus charts (recharts es caro).
export default memo(WidgetRenderer, (prev, next) =>
  prev.widget === next.widget &&
  prev.data === next.data &&
  prev.editMode === next.editMode
);
