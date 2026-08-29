"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoImage from "@/components/LogoImage";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects & Estates" },
  { href: "/videos", label: "Videos" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ logo, siteName, whatsapp }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const wa = `https://wa.me/${whatsapp}`;

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/95 backdrop-blur">
      <nav className="container flex h-20 items-center justify-between gap-4 md:h-24">
        <Link href="/" className="group flex items-center gap-3">
          <LogoImage
            src={logo}
            alt={siteName}
            width={80}
            height={80}
            priority
            animate
            className="h-14 w-14 shadow-md ring-2 ring-brand-500/20 sm:h-16 sm:w-16 md:h-20 md:w-20"
          />
          <span className="hidden text-xl font-extrabold leading-none tracking-tight text-navy-900 sm:block md:text-2xl">
            RESSA
            <span className="block text-sm font-semibold text-brand-500">
              Project Nigeria
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`text-sm font-medium transition hover:text-brand-500 ${
                    active ? "text-brand-500" : "text-navy-700"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:block">
          <a href={wa} target="_blank" rel="noopener" className="btn-primary">
            Book Inspection
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy-900 ring-1 ring-navy-200 md:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-navy-100 bg-white md:hidden">
          <ul className="container flex flex-col py-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base font-medium text-navy-800 hover:bg-navy-50"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="px-2 pb-2 pt-3">
              <a href={wa} target="_blank" rel="noopener" className="btn-primary w-full">
                Book Inspection
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
