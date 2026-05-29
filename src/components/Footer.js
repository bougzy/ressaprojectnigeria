import Link from "next/link";
import LogoImage from "@/components/LogoImage";

export default function Footer({ settings }) {
  const s = settings || {};
  const offices = s.offices || [];
  const phones = s.phones || [];
  const socials = s.socials || {};
  const year = "2024";

  return (
    <footer className="bg-navy-900 text-navy-100">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="mb-4 inline-flex items-center gap-3">
            <LogoImage
              src={s.logo}
              alt={s.siteName || "Ressa"}
              width={56}
              height={56}
              animate
              className="h-14 w-14 bg-white p-0.5 shadow-lg"
            />
            <span className="text-base font-extrabold text-white">
              RESSA
              <span className="block text-xs font-medium text-brand-400">
                Project Nigeria
              </span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-navy-200">
            {s.legalName || "Ressa Real Estate Project Ltd"} — making genuine,
            documented land &amp; home ownership affordable for every Nigerian.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
            Explore
          </h4>
          <ul className="space-y-2 text-sm">
            {[
              ["/", "Home"],
              ["/about", "About Us"],
              ["/projects", "Projects & Estates"],
              ["/videos", "Videos"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-navy-200 hover:text-brand-400">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Offices */}
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
            Our Offices
          </h4>
          <ul className="space-y-3 text-sm text-navy-200">
            {offices.map((o, i) => (
              <li key={i}>
                <span className="font-semibold text-white">{o.label}: </span>
                {o.address}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
            Contact
          </h4>
          <ul className="space-y-2 text-sm text-navy-200">
            {phones.map((p) => (
              <li key={p}>
                <a href={`tel:${p}`} className="hover:text-brand-400">
                  📞 {p}
                </a>
              </li>
            ))}
            {s.email && (
              <li>
                <a href={`mailto:${s.email}`} className="hover:text-brand-400">
                  ✉️ {s.email}
                </a>
              </li>
            )}
          </ul>
          <div className="mt-4 flex gap-3">
            {Object.entries(socials).map(([k, v]) =>
              v ? (
                <a
                  key={k}
                  href={v}
                  target="_blank"
                  rel="noopener"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold uppercase hover:bg-brand-500"
                  aria-label={k}
                >
                  {k[0]}
                </a>
              ) : null
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-navy-300 sm:flex-row">
          <p>
            © {year} {s.siteName || "Ressa Project Nigeria"}. All rights
            reserved.
          </p>
          <p>
            Built with Next.js &amp; MongoDB ·{" "}
            <Link href="/admin/login" className="hover:text-brand-400">
              Admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
