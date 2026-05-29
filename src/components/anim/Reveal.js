"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Reveals children with a fade/slide (or zoom) when scrolled into view.
 * `delay` (ms) staggers multiple items.
 */
export default function Reveal({
  children,
  className = "",
  zoom = false,
  delay = 0,
  as: Tag = "div",
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${zoom ? "reveal-zoom" : ""} ${
        shown ? "in-view" : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
