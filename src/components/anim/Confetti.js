"use client";
import { useEffect, useState } from "react";

const COLORS = ["#fc5a13", "#ec1e8c", "#3568bb", "#ffd23f", "#25d366", "#ffffff"];

/**
 * A lightweight CSS confetti burst. Fires on mount and can be re-fired by
 * changing the `fireKey` prop. Pieces clean themselves up.
 */
export default function Confetti({ count = 80, fireKey = 0, duration = 3500 }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    // Deterministic-ish pseudo random based on index (Math.random allowed in client).
    const arr = Array.from({ length: count }).map((_, i) => ({
      id: `${fireKey}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      dur: 2.4 + Math.random() * 2,
      color: COLORS[i % COLORS.length],
      size: 7 + Math.random() * 8,
      rounded: Math.random() > 0.6,
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), duration);
    return () => clearTimeout(t);
  }, [fireKey, count, duration]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.3,
            background: p.color,
            borderRadius: p.rounded ? "9999px" : "2px",
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
