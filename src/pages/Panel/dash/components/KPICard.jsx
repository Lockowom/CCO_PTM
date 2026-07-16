import { memo } from "react";
import CountUp from "./ui/CountUp";
import { BentoCard, hexToRgb } from "./ui/MagicBento";

function KPICard({ title, value, subtitle, color = "#f57c00", icon, onClick }) {
  const isNumber = typeof value === "number";
  const isPercentStr = typeof value === "string" && /^\d+([.,]\d+)?%$/.test(value);
  const numericVal = isNumber ? value : isPercentStr ? parseFloat(value.replace(",", ".")) : null;

  return (
    <BentoCard
      glowColor={hexToRgb(color)}
      onClick={onClick}
      className={`kpi-card${onClick ? " cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {title}
        </span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="text-3xl font-bold" style={{ color }}>
        {numericVal !== null ? (
          <CountUp
            end={numericVal}
            decimals={isPercentStr ? 1 : 0}
            suffix={isPercentStr ? "%" : ""}
          />
        ) : (
          value
        )}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
      )}
    </BentoCard>
  );
}

export default memo(KPICard);
