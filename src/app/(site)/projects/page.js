import { getImages } from "@/lib/content";
import Gallery from "@/components/Gallery";

export const dynamic = "force-dynamic";
export const metadata = { title: "Projects & Estates" };

export default async function ProjectsPage() {
  const [projects, flyers, events] = await Promise.all([
    getImages({ category: "project" }),
    getImages({ category: "flyer" }),
    getImages({ category: "event" }),
  ]);

  return (
    <>
      <section className="bg-navy-900 py-16 text-white md:py-20">
        <div className="container">
          <span className="eyebrow text-brand-400">Our work</span>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Projects, Estates &amp; Events
          </h1>
          <p className="mt-4 max-w-2xl text-navy-100">
            A gallery of our estate developments, project handovers, award
            presentations and member events from 2020 to date.
          </p>
        </div>
      </section>

      {(projects.length > 0 || flyers.length > 0) && (
        <section className="section">
          <div className="container">
            <h2 className="h-section mb-8">Estates &amp; project highlights</h2>
            <Gallery images={[...projects, ...flyers]} filterBy="category" />
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="section bg-navy-50">
          <div className="container">
            <h2 className="h-section mb-8">Events by year</h2>
            <Gallery images={events} filterBy="year" />
          </div>
        </section>
      )}
    </>
  );
}
