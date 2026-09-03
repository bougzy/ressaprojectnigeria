import Image from "next/image";
import Link from "next/link";
import { getImages } from "@/lib/content";
import { Icon } from "@/components/icons";
import Reveal from "@/components/anim/Reveal";
import Confetti from "@/components/anim/Confetti";
import CountUp from "@/components/anim/CountUp";
import VideoEmbed from "@/components/VideoEmbed";
import HeroSlider from "./HeroSlider";
import EventsCarousel from "./EventsCarousel";
import ProjectsMarquee from "./ProjectsMarquee";

const BG = {
  white: "bg-white",
  light: "bg-navy-50",
  dark: "bg-navy-900 text-white",
  brand: "bg-brand-500 text-white",
  gradient: "animated-gradient text-white",
};

function Wrap({ bg, className = "", children }) {
  return <section className={`${BG[bg] || BG.white} ${className}`}>{children}</section>;
}

export default async function SectionRenderer({ section, videos = [], fallbackImage, logo, siteName }) {
  if (!section || section.visible === false) return null;
  const dark = section.bg === "dark" || section.bg === "brand" || section.bg === "gradient";

  switch (section.type) {
    case "hero":
      return <HeroSlider section={section} logo={logo} siteName={siteName} />;
    case "marquee":
      return <Marquee section={section} />;
    case "stats":
      return <Stats section={section} />;
    case "richtext":
      return <RichText section={section} dark={dark} fallbackImage={fallbackImage} />;
    case "services":
      return <Services section={section} dark={dark} />;
    case "gallery":
      return <Gallery section={section} dark={dark} />;
    case "video":
      return <VideoSection section={section} dark={dark} videos={videos} />;
    case "testimonials":
      return <Testimonials section={section} dark={dark} />;
    case "faq":
      return <Faq section={section} dark={dark} />;
    case "cta":
      return <Cta section={section} />;
    case "carousel":
      return <EventsCarouselSection section={section} dark={dark} />;
    case "imageBlock":
      return <ImageBlock section={section} fallbackImage={fallbackImage} />;
    case "projectCards":
      return <ProjectCardsSection section={section} dark={dark} />;
    case "audio":
      return <AudioSection section={section} dark={dark} />;
    default:
      return null;
  }
}

/* -------------------------------- MARQUEE -------------------------------- */
function Marquee({ section }) {
  const items = Array.isArray(section.items) ? section.items : [];
  if (!items.length) return null;
  return (
    <div className={`overflow-hidden border-y border-navy-100 py-3 text-white ${BG[section.bg] || "bg-brand-500"}`}>
      <div className="marquee-track">
        {[0, 1].map((dup) => (
          <span key={dup} className="flex items-center text-sm font-semibold uppercase tracking-wide">
            {items.map((w, i) => (
              <span key={i} className="mx-6 inline-flex items-center gap-2">
                ✦ {w}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- STATS --------------------------------- */
function Stats({ section }) {
  const items = Array.isArray(section.items) ? section.items : [];
  if (!items.length) return null;
  return (
    <Wrap bg={section.bg} className="border-b border-navy-100">
      <div className="container grid grid-cols-2 gap-6 py-8 md:grid-cols-4 md:py-10">
        {items.map((st, i) => (
          <Reveal key={i} delay={i * 120} className="text-center">
            <div className="text-3xl font-extrabold text-brand-500 md:text-4xl">
              <CountUp value={st.value} />
            </div>
            <div className="mt-1 text-sm text-navy-600">{st.label}</div>
          </Reveal>
        ))}
      </div>
    </Wrap>
  );
}

/* ------------------------------- RICH TEXT -------------------------------- */
async function RichText({ section, dark, fallbackImage }) {
  const img = section.image || fallbackImage;
  const imgFirst = (section.imagePosition || "right") === "left";
  return (
    <Wrap bg={section.bg} className="section">
      <div className="container grid items-center gap-10 md:grid-cols-2">
        {img && (
          <div className={`overflow-hidden rounded-2xl ring-1 ring-navy-100 ${imgFirst ? "md:order-1" : "md:order-2"}`}>
            <Image src={img} alt={section.title || ""} width={700} height={500} className="h-full w-full object-cover" />
          </div>
        )}
        <div className={imgFirst ? "md:order-2" : "md:order-1"}>
          {section.eyebrow && <span className={`eyebrow ${dark ? "text-brand-200" : ""}`}>{section.eyebrow}</span>}
          {section.title && <h2 className="h-section mt-2">{section.title}</h2>}
          {section.body && <p className={`mt-4 leading-relaxed ${dark ? "text-navy-100" : "text-navy-600"}`}>{section.body}</p>}
          {section.ctaText && (
            <Link href={section.ctaHref || "/about"} className="btn-secondary mt-6">
              {section.ctaText}
            </Link>
          )}
        </div>
      </div>
    </Wrap>
  );
}

/* -------------------------------- SERVICES -------------------------------- */
function Services({ section, dark }) {
  const items = Array.isArray(section.items) ? section.items : [];
  return (
    <Wrap bg={section.bg} className="section">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          {section.eyebrow && <span className="eyebrow">{section.eyebrow}</span>}
          {section.title && <h2 className="h-section mt-2">{section.title}</h2>}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((svc, i) => (
            <Reveal key={i} delay={(i % 3) * 120} className="card hover:-translate-y-2 hover:shadow-xl">
              <div className="hover-wiggle flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                <Icon name={svc.icon} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-navy-900">{svc.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{svc.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

/* -------------------------------- GALLERY --------------------------------- */
async function Gallery({ section, dark }) {
  const filter = {};
  if (section.galleryCategory && section.galleryCategory !== "featured") {
    filter.category = section.galleryCategory;
  }
  let imgs = await getImages(filter);
  if (section.galleryCategory === "featured") imgs = imgs.filter((i) => i.featured);
  imgs = imgs.slice(0, section.galleryLimit || 8);
  if (!imgs.length) return null;

  return (
    <Wrap bg={section.bg} className="section">
      <div className="container">
        <div className="flex items-end justify-between gap-4">
          <div>
            {section.eyebrow && <span className="eyebrow">{section.eyebrow}</span>}
            {section.title && <h2 className="h-section mt-2">{section.title}</h2>}
            {section.subtitle && <p className={`mt-3 max-w-2xl ${dark ? "text-navy-100" : "text-navy-600"}`}>{section.subtitle}</p>}
          </div>
          {section.ctaText && (
            <Link href={section.ctaHref || "/projects"} className="hidden shrink-0 text-sm font-semibold text-brand-500 hover:underline sm:block">
              {section.ctaText} →
            </Link>
          )}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {imgs.map((img, i) => (
            <Reveal key={img._id || img.src} zoom delay={(i % 4) * 90} className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-navy-100">
              <Image src={img.src} alt={img.alt || "Ressa Project Nigeria"} fill className="object-cover transition duration-500 group-hover:scale-110 group-hover:rotate-1" sizes="(max-width:640px) 50vw, 25vw" />
              {img.year && (
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">{img.year}</span>
              )}
            </Reveal>
          ))}
        </div>
        {section.ctaText && (
          <div className="mt-8 text-center sm:hidden">
            <Link href={section.ctaHref || "/projects"} className="btn-secondary">
              {section.ctaText}
            </Link>
          </div>
        )}
      </div>
    </Wrap>
  );
}

/* --------------------------------- VIDEO ---------------------------------- */
function VideoSection({ section, dark, videos }) {
  const list = videos.slice(0, section.videoLimit || 2);
  if (!list.length) return null;
  return (
    <Wrap bg={section.bg} className="section">
      <div className="container">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          {section.eyebrow && <span className="eyebrow">{section.eyebrow}</span>}
          {section.title && <h2 className="h-section mt-2">{section.title}</h2>}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {list.map((v) => (
            <div key={v._id} className="overflow-hidden rounded-2xl ring-1 ring-navy-100">
              <div className="aspect-video">
                <VideoEmbed src={v.url} title={v.title} />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-navy-900">{v.title}</h3>
                {v.description && <p className="mt-1 text-sm text-navy-600">{v.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

/* ----------------------------- TESTIMONIALS -------------------------------- */
function Testimonials({ section, dark }) {
  const items = Array.isArray(section.items) ? section.items : [];
  if (!items.length) return null;
  return (
    <Wrap bg={section.bg} className="section">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          {section.eyebrow && <span className="eyebrow">{section.eyebrow}</span>}
          {section.title && <h2 className="h-section mt-2">{section.title}</h2>}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={i} delay={(i % 3) * 120} className="card">
              <p className="text-navy-600">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4 font-bold text-navy-900">{t.name}</div>
              {t.role && <div className="text-sm text-navy-400">{t.role}</div>}
            </Reveal>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

/* ---------------------------------- FAQ ------------------------------------ */
function Faq({ section, dark }) {
  const items = Array.isArray(section.items) ? section.items : [];
  if (!items.length) return null;
  return (
    <Wrap bg={section.bg} className="section">
      <div className="container max-w-3xl">
        <div className="mx-auto max-w-2xl text-center">
          {section.eyebrow && <span className="eyebrow">{section.eyebrow}</span>}
          {section.title && <h2 className="h-section mt-2">{section.title}</h2>}
        </div>
        <div className="mt-10 space-y-3">
          {items.map((f, i) => (
            <details key={i} className="card group cursor-pointer">
              <summary className="flex list-none items-center justify-between font-bold text-navy-900">
                {f.q}
                <span className="ml-4 shrink-0 text-brand-500 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

/* ---------------------------------- CTA ------------------------------------ */
function Cta({ section }) {
  return (
    <section className={`relative overflow-hidden ${BG[section.bg] || "bg-gradient-to-r from-brand-600 via-brand-500 to-navy-700"}`}>
      <Confetti count={70} />
      <Reveal className="container relative flex flex-col items-center gap-5 py-16 text-center text-white md:flex-row md:justify-between md:text-left">
        <div>
          {section.title && <h2 className="text-2xl font-extrabold md:text-3xl">🎊 {section.title}</h2>}
          {section.body && <p className="mt-2 max-w-xl text-brand-50">{section.body}</p>}
        </div>
        {section.ctaText && (
          <Link href={section.ctaHref || "/contact"} className="btn shrink-0 bg-white text-brand-600 hover:bg-brand-50">
            {section.ctaText}
          </Link>
        )}
      </Reveal>
    </section>
  );
}

/* ------------------------------ EVENTS CAROUSEL ----------------------------- */
function EventsCarouselSection({ section, dark }) {
  const items = Array.isArray(section.items) ? section.items : [];
  if (!items.length) return null;
  return (
    <Wrap bg={section.bg} className="section">
      <div className="container">
        {(section.eyebrow || section.title || section.subtitle) && (
          <div className="mx-auto mb-10 max-w-2xl text-center">
            {section.eyebrow && <span className="eyebrow">{section.eyebrow}</span>}
            {section.title && <h2 className="h-section mt-2">{section.title}</h2>}
            {section.subtitle && (
              <p className={`mt-3 ${dark ? "text-navy-100" : "text-navy-600"}`}>{section.subtitle}</p>
            )}
          </div>
        )}
        <EventsCarousel items={items} />
      </div>
    </Wrap>
  );
}

/* --------------------------------- IMAGE BLOCK ------------------------------ */
function ImageBlock({ section, fallbackImage }) {
  const img = section.image || fallbackImage;
  if (!img) return null;
  return (
    <Wrap bg={section.bg} className="section">
      <div className="container flex flex-col items-center text-center">
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl shadow-lg ring-1 ring-navy-100">
          <Image
            src={img}
            alt={section.body || "Ressa Project Nigeria"}
            width={1200}
            height={700}
            className="h-auto w-full object-cover"
          />
        </div>
        {section.body && (
          <p className="mt-6 max-w-2xl text-navy-600">{section.body}</p>
        )}
      </div>
    </Wrap>
  );
}

/* ------------------------------- OUR PROJECTS ------------------------------- */
function ProjectCardsSection({ section, dark }) {
  const items = Array.isArray(section.items) ? section.items : [];
  if (!items.length) return null;
  return (
    <Wrap bg={section.bg} className="section overflow-hidden">
      <div className="container">
        {(section.eyebrow || section.title || section.subtitle) && (
          <div className="mx-auto mb-10 max-w-2xl text-center">
            {section.eyebrow && <span className="eyebrow">{section.eyebrow}</span>}
            {section.title && <h2 className="h-section mt-2">{section.title}</h2>}
            {section.subtitle && (
              <p className={`mt-3 ${dark ? "text-navy-100" : "text-navy-600"}`}>{section.subtitle}</p>
            )}
          </div>
        )}
      </div>
      <div className="pb-2">
        <ProjectsMarquee items={items} />
      </div>
    </Wrap>
  );
}

/* ------------------------------- RESSA ANTHEM ------------------------------- */
function AudioSection({ section, dark }) {
  if (!section.audioSrc) return null;
  return (
    <Wrap bg={section.bg} className="section">
      <div className="container flex flex-col items-center text-center">
        {section.eyebrow && <span className="eyebrow">🎵 {section.eyebrow}</span>}
        {section.title && <h2 className="h-section mt-2">{section.title}</h2>}
        {section.subtitle && (
          <p className={`mt-3 max-w-2xl ${dark ? "text-navy-100" : "text-navy-600"}`}>{section.subtitle}</p>
        )}
        <div className="mt-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg ring-1 ring-navy-100">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls className="w-full" src={section.audioSrc}>
            Your browser does not support the audio element.
          </audio>
        </div>
        {section.body && (
          <p className={`mt-6 max-w-2xl text-sm ${dark ? "text-navy-200" : "text-navy-500"}`}>{section.body}</p>
        )}
      </div>
    </Wrap>
  );
}
