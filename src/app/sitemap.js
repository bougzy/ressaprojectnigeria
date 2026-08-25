import { getSettings } from "@/lib/content";

export default async function sitemap() {
  const s = await getSettings();
  const base = (s.canonicalUrl || "https://ressaprojectnig.com.ng").replace(/\/$/, "");
  const routes = ["", "/about", "/projects", "/videos", "/contact"];
  return routes.map((r) => ({
    url: `${base}${r}`,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}
