export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: "https://ressaprojectnig.com.ng/sitemap.xml",
  };
}
