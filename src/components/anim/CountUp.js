"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Animates a number counting up when it scrolls into view.
 * Accepts values like "5+", "1000+", "100%", "2".
 */
export default function CountUp({ value, className = "" }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState("0");
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const match = String(value).match(/^(\D*)(\d+)(\D*)$/);
    if (!match) {
      setDisplay(String(value));
      return;
    }
    const [, prefix, numStr, suffix] = match;
    const target = parseInt(numStr, 10);

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || done.current) return;
      done.current = true;
      const durationMs = 1400;
      const startTime = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - startTime) / durationMs);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.round(eased * target);
        setDisplay(`${prefix}${current}${suffix}`);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });

    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
