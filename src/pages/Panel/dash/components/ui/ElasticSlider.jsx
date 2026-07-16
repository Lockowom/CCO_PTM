import { useRef, useState, useCallback, useEffect } from "react";

/**
 * Slider con efecto elástico: al arrastrar más allá de los extremos la barra
 * "estira" (overshoot) y rebota al soltar. Controlado: el padre maneja `value`.
 */
export default function ElasticSlider({
  min = 0,
  max = 30,
  step = 1,
  value,
  onChange,
  label,
  suffix = "",
  color = "#f57c00",
}) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [overshoot, setOvershoot] = useState(0); // -1..0..1 elástico

  const pct = ((value - min) / (max - min)) * 100;

  const valueFromClientX = useCallback(
    (clientX) => {
      const track = trackRef.current;
      if (!track) return value;
      const r = track.getBoundingClientRect();
      const ratioRaw = (clientX - r.left) / r.width;
      const ratio = Math.max(0, Math.min(1, ratioRaw));
      // overshoot elástico cuando se arrastra fuera del rango
      if (ratioRaw < 0) setOvershoot(Math.max(-1, ratioRaw * 2));
      else if (ratioRaw > 1) setOvershoot(Math.min(1, (ratioRaw - 1) * 2));
      else setOvershoot(0);
      const raw = min + ratio * (max - min);
      const snapped = Math.round(raw / step) * step;
      return Math.max(min, Math.min(max, snapped));
    },
    [min, max, step, value]
  );

  const onPointerDown = (e) => {
    setDragging(true);
    e.target.setPointerCapture(e.pointerId);
    onChange(valueFromClientX(e.clientX));
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    onChange(valueFromClientX(e.clientX));
  };
  const onPointerUp = () => {
    setDragging(false);
    setOvershoot(0);
  };

  // Limpia overshoot si se suelta fuera del componente
  useEffect(() => {
    if (!dragging) setOvershoot(0);
  }, [dragging]);

  const elasticTransform = overshoot !== 0
    ? `scaleX(${1 + Math.abs(overshoot) * 0.04}) translateX(${overshoot * 6}px)`
    : "scaleX(1)";

  return (
    <div className="select-none w-full">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-semibold text-gray-600">{label}</span>
          <span className="text-[13px] font-bold tabular-nums" style={{ color }}>
            {value}{suffix}
          </span>
        </div>
      )}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative h-6 flex items-center cursor-pointer touch-none"
      >
        {/* Track base */}
        <div className="absolute left-0 right-0 h-1.5 rounded-full bg-gray-200" />
        {/* Fill elástico */}
        <div
          className="absolute left-0 h-1.5 rounded-full origin-left"
          style={{
            width: `${pct}%`,
            background: color,
            transform: elasticTransform,
            transition: dragging ? "none" : "transform 0.5s cubic-bezier(0.16, 1.4, 0.3, 1), width 0.2s ease",
          }}
        />
        {/* Thumb */}
        <div
          className="absolute w-4 h-4 rounded-full bg-white shadow-md border-2 -translate-x-1/2"
          style={{
            left: `${pct}%`,
            borderColor: color,
            transform: `translateX(-50%) scale(${dragging ? 1.25 : 1})`,
            transition: dragging ? "none" : "transform 0.3s cubic-bezier(0.16, 1.4, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );
}
