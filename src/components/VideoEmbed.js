/**
 * Renders a video URL correctly whether it's a YouTube/Vimeo embed link or a
 * locally-uploaded video file (a base64 data URI, or an mp4/webm/etc. path).
 * Works in both server and client components — no hooks, no "use client"
 * needed.
 */
export default function VideoEmbed({ src, title, className = "" }) {
  if (!src) return null;
  const isEmbeddable = src.includes("youtube.com/embed") || src.includes("player.vimeo.com");

  if (isEmbeddable) {
    return (
      <iframe
        src={src}
        title={title || "Video"}
        className={`h-full w-full ${className}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <video
      src={src}
      controls
      playsInline
      className={`h-full w-full bg-black object-contain ${className}`}
    />
  );
}
