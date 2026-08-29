"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoImage from "@/components/LogoImage";
import VideoEmbed from "@/components/VideoEmbed";

const AUTO_ADVANCE_MS = 5500;

export default function HeroSlider({ section, logo, siteName }) {
  const slides = (Array.isArray(section.items) ? section.items : []).filter((s) => s?.src);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (slides.length <= 1 || paused) return undefined;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timerRef.current);
  }, [slides.length, paused]);

  // Keep index in range if the slide list shrinks (e.g. an admin removes one).
  useEffect(() => {
    if (index >= slides.length && slides.length > 0) setIndex(0);
  }, [slides.length, index]);

  function go(i) {
    if (!slides.length) return;
    setIndex(((i % slides.length) + slides.length) % slides.length);
  }

  return (
    <section
      className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-navy-900 text-white sm:min-h-[92vh] md:min-h-screen"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className="absolute inset-0">
        {slides.length ? (
          slides.map((s, i) => (
            <div
              key={`${s.src}-${i}`}
              className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={i !== index}
            >
              <div className={`h-full w-full ${i === index ? "hero-kenburns" : ""}`}>
                {s.type === "video" ? (
                  <VideoEmbed src={s.src} title={s.caption || siteName} className="h-full w-full" />
                ) : (
                  <Image
                    src={s.src}
                    alt={s.caption || siteName || "Ressa Project Nigeria"}
                    fill
                    priority={i === 0}
                    className="object-cover"
                    sizes="100vw"
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 animated-gradient" />
        )}
        {/* Legibility overlay, tinted with the brand's red/blue */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/75 to-navy-900/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/85 via-navy-900/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/30 via-transparent to-transparent" />
      </div>

      <div className="container relative z-10 py-20 md:py-28">
        <div className="fade-up max-w-2xl">
          <LogoImage
            animate
            priority
            src={logo}
            alt={siteName}
            width={220}
            height={220}
            className="mb-6 h-24 w-24 border-4 border-white bg-white p-1.5 shadow-2xl sm:h-28 sm:w-28 md:h-36 md:w-36"
          />
          {section.eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white ring-1 ring-white/30 backdrop-blur">
              🏡 {section.eyebrow}
            </span>
          )}
          {section.title && (
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] drop-shadow-lg sm:text-5xl md:text-6xl">
              {section.title}
            </h1>
          )}
          {section.subtitle && (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 drop-shadow md:text-lg">
              {section.subtitle}
            </p>
          )}
          <div className="mt-9 flex flex-wrap gap-3">
            {section.ctaText && (
              <Link href={section.ctaHref || "/projects"} className="btn-primary shadow-xl shadow-black/30">
                {section.ctaText}
              </Link>
            )}
            {section.ctaText2 && (
              <Link
                href={section.ctaHref2 || "/contact"}
                className="btn border-2 border-white/70 bg-white/5 text-white backdrop-blur transition hover:bg-white hover:text-navy-900"
              >
                {section.ctaText2}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Prev / next arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-3 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white hover:text-navy-900 sm:flex"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-3 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white hover:text-navy-900 sm:flex"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-7 bg-brand-500" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
