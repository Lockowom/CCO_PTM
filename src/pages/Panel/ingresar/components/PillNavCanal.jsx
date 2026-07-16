import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./PillNavCanal.css";

/**
 * Selector de CANAL con animación "pill" (estilo React Bits PillNav), adaptado:
 *  - son botones que cambian estado, no enlaces.
 *  - El círculo de acento sube y rellena el pill al hover + el label se desliza
 *    a su versión blanca. El pill activo queda relleno con el acento.
 */
const PillNavCanal = ({
  items,
  active,
  onSelect,
  accent = "#ea580c",
  ease = "power3.easeOut",
}) => {
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (w === 0 || h === 0) return;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

        const label = pill.querySelector(".pc-label");
        const hover = pill.querySelector(".pc-label-hover");
        if (label) gsap.set(label, { y: 0 });
        if (hover) gsap.set(hover, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
        if (hover) {
          gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(hover, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
        }
        tlRefs.current[index] = tl;
      });
    };

    layout();
    window.addEventListener("resize", layout);
    if (document.fonts?.ready) document.fonts.ready.then(layout).catch(() => {});
    return () => window.removeEventListener("resize", layout);
  }, [items, ease]);

  const handleEnter = (i) => {
    if (active === items[i]?.value) return;
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.3, ease, overwrite: "auto" });
  };

  const handleLeave = (i) => {
    if (active === items[i]?.value) return;
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.2, ease, overwrite: "auto" });
  };

  return (
    <div className="pc-track">
      {items.map((item, i) => {
        const isActive = active === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onSelect(item.value)}
            onMouseEnter={() => handleEnter(i)}
            onMouseLeave={() => handleLeave(i)}
            className={`pc-pill ${isActive ? "pc-active" : ""}`}
            style={isActive ? { background: accent, color: "#fff" } : undefined}
          >
            <span
              className="pc-circle"
              aria-hidden="true"
              ref={(el) => { circleRefs.current[i] = el; }}
              style={{ background: accent }}
            />
            <span className="pc-label-stack">
              <span className="pc-label">{item.label}</span>
              <span className="pc-label-hover" aria-hidden="true">{item.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default PillNavCanal;
