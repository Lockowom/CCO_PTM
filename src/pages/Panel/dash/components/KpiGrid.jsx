import KPICard from "./KPICard";

// Nota: se quitaron a pedido las tarjetas OTIF, NV Semana, Incidencias,
// Recibidas, Tasa Entrega y En Riesgo. Quedan las 4 operacionales de abajo.
export default function KpiGrid({ kpis, onDetalle }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPICard
        title="NVs Activas"
        value={kpis?.activas || 0}
        color="#1565c0"
        icon="📦"
        onClick={() => onDetalle("ACTIVAS")}
      />
      <KPICard
        title="Tardanza Prom."
        value={`${kpis?.leadTimeTardanza} días`}
        subtitle="Solo entregas tardías"
        color="#c62828"
        icon="🕐"
        onClick={() => onDetalle("TARDIAS")}
      />
      <KPICard
        title="A Tiempo"
        value={`${kpis?.pctAtiempo}%`}
        subtitle="Entregado ≤ compromiso"
        color="#2e7d32"
        icon="✅"
        onClick={() => onDetalle("ATIEMPO")}
      />
      <KPICard
        title="Fill Rate"
        value={
          kpis?.fillRateShipping.pct !== null && kpis?.fillRateShipping.pct !== undefined
            ? `${kpis.fillRateShipping.pct}%`
            : "Sin datos"
        }
        subtitle={
          kpis?.fillRateShipping.pct !== null && kpis?.fillRateShipping.pct !== undefined
            ? `Salió de En Proceso ≤ compromiso (${kpis.fillRateShipping.evaluables} eval.)`
            : "Sin datos suficientes"
        }
        color="#f57c00"
        icon="📋"
        onClick={() => onDetalle("FILLRATE_NOCUMPLE")}
      />
    </div>
  );
}
