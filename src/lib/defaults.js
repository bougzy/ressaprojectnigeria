/**
 * Default site content (used to seed MongoDB and as a graceful fallback if a
 * given setting has not been customised yet). All of this is editable from the
 * admin dashboard once seeded.
 *
 * Sourced from the original ressaprojectnig.com.ng site + the event flyers.
 */
import { DEFAULT_THEME } from "./theme";

export const ORG = {
  name: "Ressa Project Nigeria",
  legalName: "Ressa Real Estate Project Ltd",
  tagline: "Land & Home Ownership for Every Nigerian",
  email: "contact@ressaprojectnig.com.ng",
  phones: ["07043331195", "08179298756"],
  whatsapp: "2347043331195",
  offices: [
    {
      label: "Lagos Office",
      address:
        "Suite 98, Tawakalitu Plaza, Opposite NIPCO Filling Station, Afolabi Bus-Stop, Lasu-Isheri Road, Lagos.",
    },
    {
      label: "Ota Office",
      address:
        "KM 10, Idiroko Road, Rainbow Bus-Stop, Opposite Christ Apostolic Church, Iyana-Iyesi, Ota, Ogun State.",
    },
  ],
  socials: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com/ressaprojectnig_18",
    twitter: "https://twitter.com",
    pinterest: "https://pinterest.com",
  },
};

export const DEFAULT_SETTINGS = {
  // ---- Site-wide / brand
  siteName: ORG.name,
  legalName: ORG.legalName,
  logo: "/images/ressa-logo.jpeg",
  tagline: ORG.tagline,

  // ---- Hero (home)
  heroTitle: "Own Land. Build Wealth. Secure Your Future.",
  heroSubtitle:
    "Ressa Project Nigeria is a real-estate support scheme making genuine, well-documented land and home ownership affordable for low and average-income earners.",
  heroPrimaryCtaText: "View Our Estates",
  heroPrimaryCtaHref: "/projects",
  heroSecondaryCtaText: "Talk to an Agent",
  heroSecondaryCtaHref: "/contact",

  // ---- Stats strip
  stats: [
    { value: "5+", label: "Years of service" },
    { value: "2", label: "Estate locations" },
    { value: "1000+", label: "Happy subscribers" },
    { value: "100%", label: "Documented titles" },
  ],

  // ---- About
  aboutHeading: "Who We Are",
  aboutBody:
    "Ressa Project Nigeria is a support scheme for low and average-income earners. Operating as Ressa Real Estate Project Ltd, we help everyday Nigerians become landlords and landladies through affordable, transparent and well-documented land and estate development. Through our PAC Estate and PLC Gardens developments, member conferences and merit-award schemes, we guide subscribers from their first plot to a completed home — backed by proper legal documentation every step of the way.",
  missionHeading: "Our Mission",
  missionBody:
    "To make land and home ownership achievable for every Nigerian, regardless of income, through honest pricing, flexible payment plans and verifiable land titles.",
  visionHeading: "Our Vision",
  visionBody:
    "A Nigeria where the average earner can confidently own property and build generational wealth — a home for all.",

  // ---- What we offer (from the conference flyer)
  services: [
    {
      title: "Affordable Land & Plots",
      desc: "Genuine, well-documented plots across our PAC Estate and PLC Gardens developments with flexible payment plans.",
      icon: "land",
    },
    {
      title: "Subscriber Discount Support",
      desc: "Up to 30% discount support for early subscribers and 20% for all members — making your first plot easier to afford.",
      icon: "discount",
    },
    {
      title: "Free Land & Merit Rewards",
      desc: "Win free land and other prizes through our merit-award scheme and Landlords' & Landladies' conferences.",
      icon: "gift",
    },
    {
      title: "Expert Guidance, Free",
      desc: "Learn diverse streams of income and sound property investment directly from experienced professionals.",
      icon: "expert",
    },
    {
      title: "Legal & Documentation Support",
      desc: "We guide investors through every legal land matter so your ownership is secure and dispute-free.",
      icon: "legal",
    },
    {
      title: "Community & Events",
      desc: "Join a growing community of landlords through our annual conferences, golf events and member gatherings.",
      icon: "community",
    },
  ],

  // ---- CTA banner
  ctaTitle: "Ready to become a landlord?",
  ctaBody:
    "Join the next Ressa Landlords' & Landladies' Support Conference and secure your plot today.",
  ctaButtonText: "Book Your Seat",
  ctaButtonHref: "/contact",

  // ---- Contact
  contactHeading: "Get in touch",
  contactIntro:
    "Have a question about our estates, payment plans or the next conference? Send us a message and our team will respond promptly.",
  email: ORG.email,
  phones: ORG.phones,
  whatsapp: ORG.whatsapp,
  offices: ORG.offices,
  socials: ORG.socials,
  mapEmbed:
    "https://www.google.com/maps?q=Lasu-Isheri+Road+Lagos&output=embed",

  // ---- SEO
  seoTitle:
    "Ressa Project Nigeria | Affordable Land & Estates in Lagos & Ota",
  seoDescription:
    "Ressa Project Nigeria (Ressa Real Estate Project Ltd) helps low and average-income earners own genuine, documented land and homes across Lagos and Ota through PAC Estate and PLC Gardens. Flexible payment plans, discount support and free-land rewards.",
  seoKeywords:
    "real estate Nigeria, land for sale Lagos, land for sale Ota, affordable land Nigeria, PAC Estate, PLC Gardens, become a landlord Nigeria",
  canonicalUrl: "https://ressaprojectnig.com.ng",

  // ---- Theme (colours + fonts) — see src/lib/theme.js
  theme: DEFAULT_THEME,
};

/**
 * Default homepage sections — this is what the site ships with, and is fully
 * editable/removable/re-orderable from the admin "Sections" tab. Re-running
 * `npm run seed` restores this default layout.
 */
export const DEFAULT_SECTIONS = [
  {
    key: "hero",
    type: "hero",
    order: 0,
    visible: true,
    bg: "gradient",
    eyebrow: ORG.name,
    title: "Own Land. Build Wealth. Secure Your Future.",
    subtitle:
      "Ressa Project Nigeria is a real-estate support scheme making genuine, well-documented land and home ownership affordable for low and average-income earners.",
    image: "",
    ctaText: "View Our Estates",
    ctaHref: "/projects",
    ctaText2: "Talk to an Agent",
    ctaHref2: "/contact",
    items: [
      { type: "image", src: "/images/office/office-flyer-summit.jpg", caption: "2026 RESSA Annual Summit — Teachers Must Become Landowners" },
      { type: "image", src: "/images/10-scaled.jpg", caption: "Another proud landowner — RESSA Merit Award" },
      { type: "image", src: "/images/office/office-exterior-1.jpg", caption: "Our head office in Lagos" },
      { type: "image", src: "/images/1-scaled.jpg", caption: "Handing over deeds — one plot of land at a time" },
      { type: "image", src: "/images/office/office-gate-banner.jpg", caption: "Teachers Must Become Landlords" },
      { type: "image", src: "/images/2-scaled.jpg", caption: "Our members, celebrating together" },
    ],
  },
  {
    key: "our-conferences",
    type: "carousel",
    order: 0.5, // just under the hero slider (order 0), above everything else
    visible: true,
    bg: "white",
    eyebrow: "Annual Events",
    title: "Our Conferences",
    subtitle: "Highlights from our yearly conferences and summits.",
    items: [
      {
        type: "video",
        src: "/videos/our-conferences-2026-edition.mp4",
        title: "2026 Edition",
        caption: "2026 Edition",
      },
    ],
  },
  {
    key: "trust-marquee",
    type: "marquee",
    order: 1,
    visible: true,
    bg: "brand",
    items: [
      "Genuine Land Titles",
      "Flexible Payment Plans",
      "PAC Estate",
      "PLC Gardens",
      "Free-Land Rewards",
      "Home for All",
      "Lagos • Ota",
    ],
  },
  {
    key: "stats",
    type: "stats",
    order: 2,
    visible: true,
    bg: "white",
    items: [
      { value: "5+", label: "Years of service" },
      { value: "2", label: "Estate locations" },
      { value: "1000+", label: "Happy subscribers" },
      { value: "100%", label: "Documented titles" },
    ],
  },
  {
    key: "about-teaser",
    type: "richtext",
    order: 3,
    visible: true,
    bg: "white",
    eyebrow: "Who We Are",
    title: "A genuine path to land & home ownership",
    body: "Ressa Project Nigeria is a support scheme for low and average-income earners. Operating as Ressa Real Estate Project Ltd, we help everyday Nigerians become landlords and landladies through affordable, transparent and well-documented land and estate development.",
    image: "",
    imagePosition: "left",
    ctaText: "Learn more about us",
    ctaHref: "/about",
    items: [],
  },
  {
    key: "services",
    type: "services",
    order: 4,
    visible: true,
    bg: "light",
    eyebrow: "What we offer",
    title: "Everything you need to own property",
    items: [
      {
        title: "Affordable Land & Plots",
        desc: "Genuine, well-documented plots across our PAC Estate and PLC Gardens developments with flexible payment plans.",
        icon: "land",
      },
      {
        title: "Subscriber Discount Support",
        desc: "Up to 30% discount support for early subscribers and 20% for all members — making your first plot easier to afford.",
        icon: "discount",
      },
      {
        title: "Free Land & Merit Rewards",
        desc: "Win free land and other prizes through our merit-award scheme and Landlords' & Landladies' conferences.",
        icon: "gift",
      },
      {
        title: "Expert Guidance, Free",
        desc: "Learn diverse streams of income and sound property investment directly from experienced professionals.",
        icon: "expert",
      },
      {
        title: "Legal & Documentation Support",
        desc: "We guide investors through every legal land matter so your ownership is secure and dispute-free.",
        icon: "legal",
      },
      {
        title: "Community & Events",
        desc: "Join a growing community of landlords through our annual conferences, golf events and member gatherings.",
        icon: "community",
      },
    ],
  },
  {
    key: "featured-projects",
    type: "gallery",
    order: 5,
    visible: true,
    bg: "white",
    eyebrow: "Our work",
    title: "Latest projects & estates",
    galleryCategory: "project",
    galleryLimit: 8,
    ctaText: "View all",
    ctaHref: "/projects",
    items: [],
  },
  {
    key: "events",
    type: "gallery",
    order: 6,
    visible: true,
    bg: "light",
    eyebrow: "Community",
    title: "Moments from our events",
    subtitle:
      "Conferences, award presentations and member gatherings from across the years.",
    galleryCategory: "event",
    galleryLimit: 8,
    ctaText: "See full gallery",
    ctaHref: "/projects",
    items: [],
  },
  {
    key: "videos",
    type: "video",
    order: 7,
    visible: true,
    bg: "white",
    eyebrow: "Ressa videos",
    title: "Watch & learn",
    videoLimit: 2,
    items: [],
  },
  {
    key: "testimonials",
    type: "testimonials",
    order: 8,
    visible: false,
    bg: "light",
    eyebrow: "Testimonials",
    title: "What our subscribers say",
    items: [
      {
        name: "A. Subscriber",
        role: "PAC Estate landowner",
        quote: "Ressa made it possible for me to finally own my own plot with a clear, honest payment plan.",
      },
    ],
  },
  {
    key: "faq",
    type: "faq",
    order: 9,
    visible: false,
    bg: "white",
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    items: [
      {
        q: "Are Ressa land titles genuine and documented?",
        a: "Yes — every plot comes with proper legal documentation and our team guides subscribers through the full process.",
      },
    ],
  },
  {
    key: "cta-banner",
    type: "cta",
    order: 10,
    visible: true,
    bg: "gradient",
    title: "Ready to become a landlord?",
    body: "Join the next Ressa Landlords' & Landladies' Support Conference and secure your plot today.",
    ctaText: "Book Your Seat",
    ctaHref: "/contact",
  },
  {
    key: "events-carousel",
    type: "carousel",
    order: 11,
    visible: true,
    bg: "light",
    eyebrow: "Community",
    title: "Our Events",
    subtitle: "A look back at our conferences, award nights and member gatherings.",
    items: [
      { type: "image", src: "/images/1713178107650.jpg", caption: "" },
      { type: "image", src: "/images/1713178111141.jpg", caption: "" },
      { type: "image", src: "/images/1713178113592.jpg", caption: "" },
      { type: "image", src: "/images/1713178117287.jpg", caption: "" },
    ],
  },
  {
    key: "image-text-block",
    type: "imageBlock",
    order: 12,
    visible: true,
    bg: "white",
    image: "",
    body: "",
    items: [],
  },
  {
    key: "our-projects",
    type: "projectCards",
    order: 13,
    visible: true,
    bg: "light",
    eyebrow: "Portfolio",
    title: "Our Projects",
    subtitle: "Browse our estate phases — tap any card to view it in full.",
    items: [
      {
        type: "image",
        src: "/images/phase-1.jpg",
        title: "Phase 1",
        caption: "NGN 1.5M per plot — secure environment, good road network, perimeter fencing, electricity, instant allocation.",
      },
      {
        type: "image",
        src: "/images/phase-2-annex-a.jpg",
        title: "Phase 2 — Annex A",
        caption: "NGN 1.5M per plot — layout & master plan, well-planned roads, green areas, modern infrastructure.",
      },
      {
        type: "image",
        src: "/images/phase-2-annex-b.jpg",
        title: "Phase 2 — Annex B",
        caption: "NGN 1.5M per plot — secure environment, good road network, instant allocation.",
      },
      {
        type: "image",
        src: "/images/phase-3.jpg",
        title: "Phase 3",
        caption: "NGN 1.5M per plot — 24/7 security, well paved roads, steady electricity, estate management.",
      },
      {
        type: "image",
        src: "/images/phase-3-extension.jpg",
        title: "Phase 3 Extension",
        caption: "NGN 1.5M per plot — secure environment, flexible payment plan, instant allocation.",
      },
      {
        type: "image",
        src: "/images/phase-4.jpg",
        title: "Phase 4",
        caption: "NGN 1.0M per plot — 24/7 security, well paved roads, flexible payment plan available.",
      },
    ],
  },
  {
    key: "our-office",
    type: "carousel",
    order: 14,
    visible: true,
    bg: "white",
    eyebrow: "Visit Us",
    title: "Our Office",
    subtitle: "Take a look inside the Ressa Project Nigeria office.",
    items: [
      { type: "image", src: "/images/office/office-exterior-1.jpg", caption: "Our head office building" },
      { type: "image", src: "/images/office/office-exterior-2.jpg", caption: "Office building — front view" },
      { type: "image", src: "/images/office/office-entrance.jpg", caption: "Office entrance" },
      { type: "image", src: "/images/office/office-lobby.jpg", caption: "Reception lobby" },
      { type: "image", src: "/images/office/office-reception-desk.jpg", caption: "Front desk" },
      { type: "image", src: "/images/office/office-interior-landing.jpg", caption: "Upper floor landing & seating area" },
      { type: "image", src: "/images/office/office-lounge-1.jpg", caption: "Waiting lounge" },
      { type: "image", src: "/images/office/office-boardroom.jpg", caption: "Boardroom & meeting area" },
      { type: "image", src: "/images/office/office-gate-banner.jpg", caption: "Ressa Real Estate Project Development — Teachers Must Become Landlords" },
      { type: "image", src: "/images/office/office-flyer-summit.jpg", caption: "2026 RESSA Annual Summit — Teachers Must Become Landowners" },
    ],
  },
];

/**
 * Heuristic categorisation of the downloaded image filenames so every image is
 * placed somewhere sensible on first seed. The admin can re-categorise later.
 */
export const DEFAULT_EXTRA_IMAGES = [
  { src: "/images/office/office-exterior-1.jpg", alt: "Ressa office building exterior", category: "about" },
  { src: "/images/office/office-exterior-2.jpg", alt: "Ressa office building, front view", category: "about" },
  { src: "/images/office/office-entrance.jpg", alt: "Office entrance", category: "about" },
  { src: "/images/office/office-lobby.jpg", alt: "Reception lobby", category: "about" },
  { src: "/images/office/office-reception-desk.jpg", alt: "Front desk", category: "about" },
  { src: "/images/office/office-interior-landing.jpg", alt: "Upper floor landing & seating area", category: "about" },
  { src: "/images/office/office-lounge-1.jpg", alt: "Waiting lounge", category: "about" },
  { src: "/images/office/office-boardroom.jpg", alt: "Boardroom & meeting area", category: "about" },
  { src: "/images/office/office-gate-banner.jpg", alt: "Teachers Must Become Landlords banner", category: "flyer" },
  { src: "/images/office/office-flyer-summit.jpg", alt: "2026 RESSA Annual Summit flyer", category: "flyer" },
];

export function categorise(filename) {
  const f = filename.toLowerCase();
  if (f.includes("logo")) return { category: "logo", year: "" };
  // Branded posters / flyers
  if (
    f.startsWith("sc-2") ||
    f === "ressa.jpg" ||
    f.startsWith("man-") ||
    f.startsWith("photo_5832360396361679")
  )
    return { category: "flyer", year: "2024" };
  // 2020 launch / early events
  if (f.startsWith("img-20200128") || f.startsWith("img-20200130"))
    return { category: "event", year: "2020" };
  // April 2024 project handovers & awards
  if (
    f.startsWith("img-20240415") ||
    f.startsWith("1713178") ||
    f.startsWith("km1_")
  )
    return { category: "event", year: "2024" };
  // August 2024 conference
  if (f.startsWith("img_20240824") || f.startsWith("1724575645956"))
    return { category: "event", year: "2024" };
  // Numbered "latest projects"
  if (/^\d+-scaled\.jpg$/.test(f) || /^\d+\.jpg$/.test(f))
    return { category: "project", year: "2024" };
  // Phase flyers (Our Projects card section)
  if (f.startsWith("phase-")) return { category: "project", year: "2025" };
  // Decorative / stock
  if (f.startsWith("130-2") || f.startsWith("top-view"))
    return { category: "misc", year: "" };
  return { category: "event", year: "" };
}

export function prettyAlt(filename, category) {
  const map = {
    logo: "Ressa Project Nigeria logo",
    flyer: "Ressa Project Nigeria event flyer",
    project: "Ressa estate project photo",
    event: "Ressa Project Nigeria event photo",
    about: "Ressa Project Nigeria team",
    misc: "Ressa Project Nigeria",
  };
  return map[category] || "Ressa Project Nigeria";
}
