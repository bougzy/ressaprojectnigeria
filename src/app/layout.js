import "./globals.css";
import { getSettings } from "@/lib/content";
import ThemeStyle from "@/components/ThemeStyle";

const SITE_URL = "https://ressaprojectnig.com.ng";

export async function generateMetadata() {
  const s = await getSettings();
  const canonical = s.canonicalUrl || SITE_URL;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: s.seoTitle || s.siteName,
      template: `%s | ${s.siteName}`,
    },
    description: s.seoDescription,
    keywords: (s.seoKeywords || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: s.seoTitle || s.siteName,
      description: s.seoDescription,
      siteName: s.siteName,
      locale: "en_NG",
      images: [{ url: s.logo || "/images/ressa-logo.jpeg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: s.seoTitle || s.siteName,
      description: s.seoDescription,
      images: [s.logo || "/images/ressa-logo.jpeg"],
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fc5a13",
};

export default async function RootLayout({ children }) {
  const s = await getSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: s.siteName,
    legalName: s.legalName,
    description: s.seoDescription,
    url: s.canonicalUrl || SITE_URL,
    logo: s.logo ? `${s.canonicalUrl || SITE_URL}${s.logo}` : undefined,
    image: s.logo ? `${s.canonicalUrl || SITE_URL}${s.logo}` : undefined,
    telephone: s.phones?.[0],
    email: s.email,
    address: (s.offices || []).map((o) => ({
      "@type": "PostalAddress",
      streetAddress: o.address,
      addressLocality: o.label,
      addressCountry: "NG",
    })),
    sameAs: Object.values(s.socials || {}).filter(Boolean),
    areaServed: "Nigeria",
  };

  return (
    <html lang="en">
      <body>
        <ThemeStyle theme={s.theme} />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
