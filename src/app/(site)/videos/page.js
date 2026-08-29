import { getVideos } from "@/lib/content";
import VideoEmbed from "@/components/VideoEmbed";

export const dynamic = "force-dynamic";
export const metadata = { title: "Videos" };

export default async function VideosPage() {
  const videos = await getVideos();

  return (
    <>
      <section className="bg-navy-900 py-16 text-white md:py-20">
        <div className="container">
          <span className="eyebrow text-brand-400">Ressa Videos</span>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Watch our story
          </h1>
          <p className="mt-4 max-w-2xl text-navy-100">
            Conference highlights, testimonials and guides to owning your first
            plot with Ressa Project Nigeria.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {videos.length === 0 ? (
            <p className="py-10 text-center text-navy-400">
              No videos have been added yet. Add them from the admin panel.
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {videos.map((v) => (
                <div
                  key={v._id}
                  className="overflow-hidden rounded-2xl ring-1 ring-navy-100"
                >
                  <div className="aspect-video">
                    <VideoEmbed src={v.url} title={v.title} />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-navy-900">
                      {v.title}
                    </h3>
                    {v.description && (
                      <p className="mt-2 text-sm leading-relaxed text-navy-600">
                        {v.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
