import { getSettings } from "@/lib/content";
import ContactForm from "@/components/ContactForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const s = await getSettings();

  return (
    <>
      <section className="bg-navy-900 py-16 text-white md:py-20">
        <div className="container">
          <span className="eyebrow text-brand-400">Contact</span>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            {s.contactHeading || "Get in touch"}
          </h1>
          <p className="mt-4 max-w-2xl text-navy-100">{s.contactIntro}</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-10 lg:grid-cols-2">
          {/* Info */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-bold text-navy-900">Call us</h3>
              <div className="mt-2 space-y-1">
                {(s.phones || []).map((p) => (
                  <a
                    key={p}
                    href={`tel:${p}`}
                    className="block text-navy-600 hover:text-brand-500"
                  >
                    📞 {p}
                  </a>
                ))}
              </div>
              {s.email && (
                <a
                  href={`mailto:${s.email}`}
                  className="mt-2 block text-navy-600 hover:text-brand-500"
                >
                  ✉️ {s.email}
                </a>
              )}
              {s.whatsapp && (
                <a
                  href={`https://wa.me/${s.whatsapp}`}
                  target="_blank"
                  rel="noopener"
                  className="btn-primary mt-4"
                >
                  Chat on WhatsApp
                </a>
              )}
            </div>

            {(s.offices || []).map((o, i) => (
              <div key={i} className="card">
                <h3 className="font-bold text-navy-900">{o.label}</h3>
                <p className="mt-2 text-navy-600">{o.address}</p>
              </div>
            ))}

            {s.mapEmbed && (
              <div className="overflow-hidden rounded-2xl ring-1 ring-navy-100">
                <iframe
                  src={s.mapEmbed}
                  className="h-64 w-full"
                  loading="lazy"
                  title="Map"
                />
              </div>
            )}
          </div>

          {/* Form */}
          <div>
            <h2 className="h-section mb-6">Send us a message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
