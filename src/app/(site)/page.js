import { getSettings, getImages, getVideos, getSections } from "@/lib/content";
import SectionRenderer from "@/components/sections/SectionRenderer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [s, sections, flyers, projects, videos] = await Promise.all([
    getSettings(),
    getSections("home"),
    getImages({ category: "flyer" }),
    getImages({ category: "project" }),
    getVideos(),
  ]);

  const fallbackImage = flyers[0]?.src || projects[0]?.src || "/images/SC-2.jpg";

  return (
    <>
      {sections.map((section) => (
        <SectionRenderer
          key={section._id || section.key}
          section={section}
          videos={videos}
          fallbackImage={fallbackImage}
        />
      ))}
    </>
  );
}
