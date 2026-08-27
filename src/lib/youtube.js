/** Converts common YouTube watch/share links into embeddable URLs. Leaves
 * any other URL (direct mp4, already-embed link, etc.) untouched. */
export function normalizeYouTube(url) {
  if (!url) return url;
  const watch = url.match(/[?&]v=([\w-]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  const short = url.match(/youtu\.be\/([\w-]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  return url;
}
