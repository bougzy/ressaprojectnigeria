"use client";
import { useMemo, useState } from "react";
import Image from "next/image";

/**
 * Filterable, responsive image grid with a lightbox.
 * `images` = [{ src, alt, caption, category, year }]
 * `filters` = optional array of { key, label } to filter by year/category.
 */
export default function Gallery({ images = [], filterBy = "year" }) {
  const [active, setActive] = useState("all");
  const [lightbox, setLightbox] = useState(null);

  const filters = useMemo(() => {
    const vals = new Set();
    images.forEach((i) => {
      const v = i[filterBy];
      if (v) vals.add(v);
    });
    const sorted = [...vals].sort((a, b) => (a < b ? 1 : -1));
    return ["all", ...sorted];
  }, [images, filterBy]);

  const shown =
    active === "all" ? images : images.filter((i) => i[filterBy] === active);

  const idx = lightbox != null ? shown.findIndex((i) => i.src === lightbox.src) : -1;
  const go = (d) => {
    if (idx < 0) return;
    const next = (idx + d + shown.length) % shown.length;
    setLightbox(shown[next]);
  };

  return (
    <div>
      {filters.length > 2 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active === f
                  ? "bg-brand-500 text-white"
                  : "bg-navy-50 text-navy-700 hover:bg-navy-100"
              }`}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>
      )}

      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
        {shown.map((img) => (
          <button
            key={img.src}
            onClick={() => setLightbox(img)}
            className="group block w-full overflow-hidden rounded-xl ring-1 ring-navy-100"
          >
            <Image
              src={img.src}
              alt={img.alt || "Ressa project"}
              width={500}
              height={375}
              className="h-auto w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="py-10 text-center text-navy-400">No images yet.</p>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 text-3xl text-white/80 hover:text-white"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            ×
          </button>
          <button
            className="absolute left-3 text-4xl text-white/70 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous"
          >
            ‹
          </button>
          <figure
            className="max-h-[88vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.src}
              alt={lightbox.alt || ""}
              width={1200}
              height={900}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
            {lightbox.caption && (
              <figcaption className="mt-3 text-center text-sm text-white/80">
                {lightbox.caption}
              </figcaption>
            )}
          </figure>
          <button
            className="absolute right-3 text-4xl text-white/70 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
