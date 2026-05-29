import Image from "next/image";
import Link from "next/link";
import { getSettings, getImages, getVideos } from "@/lib/content";
import { Icon } from "@/components/icons";
import Reveal from "@/components/anim/Reveal";
import Confetti from "@/components/anim/Confetti";
import CountUp from "@/components/anim/CountUp";
import LogoImage from "@/components/LogoImage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [s, flyers, projects, events, videos] = await Promise.all([
    getSettings(),
    getImages({ category: "flyer" }),
    getImages({ category: "project" }),
    getImages({ category: "event" }),
    getVideos(),
  ]);

  const heroImg =
    flyers[0]?.src || projects[0]?.src || "/images/SC-2.jpg";
  const featuredProjects = [...projects, ...flyers].slice(0, 8);
  const featuredEvents = events.slice(0, 8);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="animated-gradient relative overflow-hidden text-white">
        {/* floating colour blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blob absolute -left-16 top-10 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="blob absolute right-0 top-1/2 h-72 w-72 rounded-full bg-pink-500/25 blur-3xl" style={{ animationDelay: "2s" }} />
          <div className="blob absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-navy-400/30 blur-3xl" style={{ animationDelay: "4s" }} />
        </div>
        {/* faint project photo texture */}
        <div className="absolute inset-0 opacity-10">
          <Image src={projects[0]?.src || heroImg} alt="" fill className="object-cover" priority />
        </div>
        {/* party confetti on load */}
        <Confetti count={90} />

        <div className="container relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-200 ring-1 ring-white/20 backdrop-blur">
              🎉 {s.legalName}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight drop-shadow-sm sm:text-4xl md:text-5xl">
              {s.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-100 md:text-lg">
              {s.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={s.heroPrimaryCtaHref || "/projects"} className="btn-primary">
                {s.heroPrimaryCtaText || "View Our Estates"}
              </Link>
              <Link
                href={s.heroSecondaryCtaHref || "/contact"}
                className="btn border border-white/40 text-white hover:bg-white/10"
              >
                {s.heroSecondaryCtaText || "Talk to an Agent"}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto hidden max-w-sm md:block">
            {/* big floating logo behind the flyer */}
            <LogoImage
              animate
              width={120}
              height={120}
              className="absolute -left-10 -top-10 z-10 h-28 w-28 bg-white p-1 shadow-2xl"
            />
            <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 transition duration-500 hover:scale-[1.02] hover:rotate-1">
              <Image
                src={heroImg}
                alt="Ressa Project Nigeria flyer"
                width={500}
                height={700}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- MARQUEE TRUST BAR ---------------- */}
      <div className="overflow-hidden border-y border-navy-100 bg-brand-500 py-3 text-white">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <span key={dup} className="flex items-center text-sm font-semibold uppercase tracking-wide">
              {["Genuine Land Titles", "Flexible Payment Plans", "PAC Estate", "PLC Gardens", "Free-Land Rewards", "Home for All", "Lagos • Ota"].map((w) => (
                <span key={w} className="mx-6 inline-flex items-center gap-2">
                  ✦ {w}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ---------------- STATS ---------------- */}
      <section className="border-b border-navy-100 bg-white">
        <div className="container grid grid-cols-2 gap-6 py-8 md:grid-cols-4 md:py-10">
          {(s.stats || []).map((st, i) => (
            <Reveal key={i} delay={i * 120} className="text-center">
              <div className="text-3xl font-extrabold text-brand-500 md:text-4xl">
                <CountUp value={st.value} />
              </div>
              <div className="mt-1 text-sm text-navy-600">{st.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- ABOUT TEASER ---------------- */}
      <section className="section">
        <div className="container grid items-center gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl ring-1 ring-navy-100">
            <Image
              src={
                events.find((e) => e.year === "2024")?.src ||
                events[0]?.src ||
                heroImg
              }
              alt="About Ressa Project Nigeria"
              width={700}
              height={500}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <span className="eyebrow">{s.aboutHeading}</span>
            <h2 className="h-section mt-2">
              A genuine path to land &amp; home ownership
            </h2>
            <p className="mt-4 leading-relaxed text-navy-600">{s.aboutBody}</p>
            <Link href="/about" className="btn-secondary mt-6">
              Learn more about us
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- SERVICES ---------------- */}
      <section className="section bg-navy-50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">What we offer</span>
            <h2 className="h-section mt-2">Everything you need to own property</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(s.services || []).map((svc, i) => (
              <Reveal
                key={i}
                delay={(i % 3) * 120}
                className="card hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="hover-wiggle flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                  <Icon name={svc.icon} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-navy-900">
                  {svc.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">
                  {svc.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FEATURED PROJECTS ---------------- */}
      {featuredProjects.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Our work</span>
                <h2 className="h-section mt-2">Latest projects &amp; estates</h2>
              </div>
              <Link
                href="/projects"
                className="hidden shrink-0 text-sm font-semibold text-brand-500 hover:underline sm:block"
              >
                View all →
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {featuredProjects.map((img, i) => (
                <Reveal
                  key={img._id || img.src}
                  zoom
                  delay={(i % 4) * 90}
                  className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-navy-100"
                >
                  <Image
                    src={img.src}
                    alt={img.alt || "Ressa project"}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110 group-hover:rotate-1"
                    sizes="(max-width:640px) 50vw, 25vw"
                  />
                </Reveal>
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link href="/projects" className="btn-secondary">
                View all projects
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- EVENTS ---------------- */}
      {featuredEvents.length > 0 && (
        <section className="section bg-navy-50">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">Community</span>
              <h2 className="h-section mt-2">Moments from our events</h2>
              <p className="mt-3 text-navy-600">
                Conferences, award presentations and member gatherings from
                across the years.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {featuredEvents.map((img, i) => (
                <Reveal
                  key={img._id || img.src}
                  zoom
                  delay={(i % 4) * 90}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-navy-100"
                >
                  <Image
                    src={img.src}
                    alt={img.alt || "Ressa event"}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                    sizes="(max-width:640px) 50vw, 25vw"
                  />
                  {img.year && (
                    <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                      {img.year}
                    </span>
                  )}
                </Reveal>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/projects" className="btn-secondary">
                See full gallery
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- VIDEOS TEASER ---------------- */}
      {videos.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <span className="eyebrow">Ressa videos</span>
              <h2 className="h-section mt-2">Watch &amp; learn</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {videos.slice(0, 2).map((v) => (
                <div key={v._id} className="overflow-hidden rounded-2xl ring-1 ring-navy-100">
                  <div className="aspect-video">
                    <iframe
                      src={v.url}
                      title={v.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-navy-900">{v.title}</h3>
                    {v.description && (
                      <p className="mt-1 text-sm text-navy-600">{v.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- CTA ---------------- */}
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-brand-500 to-pink-500">
        <Confetti count={70} />
        <Reveal className="container relative flex flex-col items-center gap-5 py-16 text-center text-white md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">🎊 {s.ctaTitle}</h2>
            <p className="mt-2 max-w-xl text-brand-50">{s.ctaBody}</p>
          </div>
          <Link
            href={s.ctaButtonHref || "/contact"}
            className="btn shrink-0 bg-white text-brand-600 hover:bg-brand-50"
          >
            {s.ctaButtonText || "Book Your Seat"}
          </Link>
        </Reveal>
      </section>
    </>
  );
}
