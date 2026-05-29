import "./globals.css";
import { getSettings } from "@/lib/content";

export async function generateMetadata() {
  const s = await getSettings();
  return {
    metadataBase: new URL("https://ressaprojectnig.com.ng"),
    title: {
      default: s.seoTitle || s.siteName,
      template: `%s | ${s.siteName}`,
    },
    description: s.seoDescription,
    keywords: [
      "Ressa Project Nigeria",
      "real estate Nigeria",
      "land for sale Lagos",
      "land for sale Ota",
      "affordable land Nigeria",
      "PAC Estate",
      "PLC Gardens",
      "become a landlord Nigeria",
    ],
    openGraph: {
      type: "website",
      title: s.seoTitle || s.siteName,
      description: s.seoDescription,
      siteName: s.siteName,
      images: [{ url: s.logo || "/images/ressa-logo.jpeg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: s.seoTitle || s.siteName,
      description: s.seoDescription,
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
