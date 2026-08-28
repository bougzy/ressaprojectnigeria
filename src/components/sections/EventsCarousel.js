"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import VideoEmbed from "@/components/VideoEmbed";

export default function EventsCarousel({ items = [] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);
  const count = items.length;

  const go = useCallback(
    (i) => setIndex(((i % count) + count) % count),
    [count]
  );
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (paused || count < 2) return;
    timer.current = setInterval(next, 5000);
    return () => clearInterval(timer.current);
  }, [paused, count, next]);

  if (!count) return null;
  const item = items[index];

  return (
    <div
      className="relative mx-auto max-w-4xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-navy-900 shadow-xl ring-1 ring-navy-100">
        {item.type === "video" ? (
          <VideoEmbed src={item.src} title={item.caption || `Event video ${index + 1}`} />
        ) : (
          <Image
            key={item.src}
            src={item.src}
            alt={item.caption || `Event photo ${index + 1}`}
            fill
            className="object-cover transition duration-500"
            sizes="(max-width: 768px) 100vw, 800px"
            priority={index === 0}
          />
        )}

        {item.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-sm font-medium text-white">{item.caption}</p>
          </div>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-navy-900 shadow transition hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-navy-900 shadow transition hover:bg-white"
            >
              ›
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {items.map((it, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => go(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-brand-500" : "w-2.5 bg-navy-200 hover:bg-navy-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
