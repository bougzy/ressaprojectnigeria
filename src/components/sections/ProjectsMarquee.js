"use client";
import { useState } from "react";
import Image from "next/image";
import VideoEmbed from "@/components/VideoEmbed";

function Card({ item, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group relative w-64 shrink-0 overflow-hidden rounded-2xl bg-navy-900 text-left shadow-md ring-1 ring-navy-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-72"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {item.type === "video" ? (
          <>
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={item.title || "Project video"}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="288px"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-navy-800 to-navy-950" />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-xl text-navy-900 shadow">
                ▶
              </span>
            </div>
          </>
        ) : (
          <Image
            src={item.src}
            alt={item.title || "Project photo"}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="288px"
          />
        )}
      </div>
      {(item.title || item.caption) && (
        <div className="p-4">
          {item.title && <h4 className="font-bold text-white">{item.title}</h4>}
          {item.caption && (
            <p className="mt-1 line-clamp-2 text-xs text-navy-200">{item.caption}</p>
          )}
        </div>
      )}
    </button>
  );
}

export default function ProjectsMarquee({ items = [] }) {
  const [active, setActive] = useState(null);
  if (!items.length) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden pl-4 sm:pl-8">
        <div className={`marquee-cards-track ${active ? "is-paused" : ""}`}>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex gap-5 pr-5">
              {items.map((item, i) => (
                <Card key={`${dup}-${i}`} item={item} onOpen={setActive} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full bg-navy-900">
              {active.type === "video" ? (
                <VideoEmbed src={active.src} title={active.title || "Project video"} />
              ) : (
                <Image
                  src={active.src}
                  alt={active.title || "Project photo"}
                  fill
                  className="object-contain"
                  sizes="800px"
                />
              )}
              <button
                type="button"
                aria-label="Close"
                onClick={() => setActive(null)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow hover:bg-white"
              >
                ✕
              </button>
            </div>
            {(active.title || active.caption) && (
              <div className="p-5">
                {active.title && <h3 className="text-lg font-bold text-navy-900">{active.title}</h3>}
                {active.caption && <p className="mt-2 text-sm text-navy-600">{active.caption}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
