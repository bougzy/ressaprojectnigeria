import Image from "next/image";
import Link from "next/link";
import { getSettings, getImages } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "About Us" };

export default async function AboutPage() {
  const [s, flyers, events] = await Promise.all([
    getSettings(),
    getImages({ category: "flyer" }),
    getImages({ category: "event" }),
  ]);
  const lead = flyers[0]?.src || events[0]?.src || "/images/SC-2.jpg";

  return (
    <>
      {/* Header */}
      <section className="bg-navy-900 py-16 text-white md:py-20">
        <div className="container">
          <span className="eyebrow text-brand-400">About</span>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            {s.aboutHeading || "Who We Are"}
          </h1>
          <p className="mt-4 max-w-3xl text-navy-100">{s.tagline}</p>
        </div>
      </section>

      {/* Intro + image */}
      <section className="section">
        <div className="container grid items-start gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl ring-1 ring-navy-100">
            <Image
              src={lead}
              alt="About Ressa Project Nigeria"
              width={700}
              height={520}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div>
            <h2 className="h-section">{s.legalName}</h2>
            <p className="mt-4 leading-relaxed text-navy-600">{s.aboutBody}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="card">
                <h3 className="font-bold text-brand-500">{s.missionHeading}</h3>
                <p className="mt-2 text-sm text-navy-600">{s.missionBody}</p>
              </div>
              <div className="card">
                <h3 className="font-bold text-brand-500">{s.visionHeading}</h3>
                <p className="mt-2 text-sm text-navy-600">{s.visionBody}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="section bg-navy-50">
        <div className="container">
          <h2 className="h-section text-center">Visit our offices</h2>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
            {(s.offices || []).map((o, i) => (
              <div key={i} className="card">
                <h3 className="text-lg font-bold text-navy-900">{o.label}</h3>
                <p className="mt-2 text-navy-600">{o.address}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/contact" className="btn-primary">
              Contact our team
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
