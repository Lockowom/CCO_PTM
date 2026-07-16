import { useEffect, useRef, useState } from "react";

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export default function CountUp({
  end,
  duration = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}) {
  const [display, setDisplay] = useState("0");
  const prevEnd = useRef(0);
  const rafId = useRef(0);

  useEffect(() => {
    const startVal = prevEnd.current;
    const diff = end - startVal;
    if (diff === 0) return;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = startVal + diff * easeOutExpo(progress);
      setDisplay(value.toFixed(decimals));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        prevEnd.current = end;
      }
    };
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [end, duration, decimals]);

  return (
    <span className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
