import { useRef } from "react";

/**
 * Magic Bento card: tarjeta con un glow radial que SIGUE el cursor + borde
 * reactivo al hover. Puramente presentacional (mide el mouse vía CSS vars,
 * sin re-render de React). Envolver cualquier contenido.
 */
export function BentoCard({ children, glowColor = "245,124,0", className = "", onClick }) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onClick={onClick}
      className={`bento-card ${className}`}
      style={{ "--glow": glowColor }}
    >
      <span className="bento-card-glow" aria-hidden />
      <div className="bento-card-content">{children}</div>
    </div>
  );
}

export { hexToRgb } from "../../dashHelpers";
