import { getSettings } from "@/lib/content";

export default async function robots() {
  const s = await getSettings();
  const base = (s.canonicalUrl || "https://ressaprojectnig.com.ng").replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${base}/sitemap.xml`,
  };
}
