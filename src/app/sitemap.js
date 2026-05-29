export default function sitemap() {
  const base = "https://ressaprojectnig.com.ng";
  const routes = ["", "/about", "/projects", "/videos", "/contact"];
  return routes.map((r) => ({
    url: `${base}${r}`,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}
