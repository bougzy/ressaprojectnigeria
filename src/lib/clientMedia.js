/* Client-side helpers for picking, compressing and uploading local files
 * from the admin dashboard.
 *
 * Why this exists: Vercel's serverless functions have a read-only
 * filesystem in production (only /tmp is writable, and it isn't shared or
 * persistent). Writing uploads to /public/images — which is how this app
 * used to work — silently fails in production. Uploaded files are now
 * stored as base64 data URIs directly in MongoDB (which this project
 * already uses), so uploads work identically in local dev and on Vercel
 * with no extra setup or paid storage service required.
 *
 * That approach has one real constraint: serverless functions accept a
 * limited request body size (a few MB). To work within that invisibly:
 *   - Images are resized/compressed in the browser before upload, so a
 *     multi-megabyte phone photo becomes a few hundred KB.
 *   - Multiple files are automatically split into several sequential
 *     upload requests ("batches") so a big multi-select never fails —
 *     the caller doesn't need to think about this at all.
 */

// Resize + re-encode an image file in-browser so it uploads quickly and
// safely fits the server's request-size limit. Non-image files, or any
// file the browser can't decode as an image, are returned unchanged.
export async function compressImageFile(file, { maxDim = 1600, quality = 0.82 } = {}) {
  if (!file.type?.startsWith("image/")) return file;
  // Let animated GIFs through as-is — canvas would flatten them to one frame.
  if (file.type === "image/gif") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, w, h);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) return file;

    const newName = (file.name || "photo").replace(/\.[a-z0-9]+$/i, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // If the browser can't decode/compress it (e.g. HEIC on some browsers),
    // fall back to uploading the original — the server will still enforce
    // its own size limit and report a clear error if it's too large.
    return file;
  }
}

// Upload a list of File objects, automatically splitting them into
// multiple requests so no single request exceeds a safe size. Returns the
// combined list of created records (images or videos, depending on kind).
export async function uploadFilesInBatches(
  files,
  meta,
  kind = "image",
  maxBatchBytes = 3 * 1024 * 1024
) {
  const results = [];
  const errors = [];
  let batch = [];
  let batchBytes = 0;

  async function flush() {
    if (!batch.length) return;
    const fd = new FormData();
    fd.append("kind", kind);
    Object.entries(meta || {}).forEach(([k, v]) => fd.append(k, String(v)));
    batch.forEach((f) => fd.append("files", f, f.name));

    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      errors.push(data.error || "Upload failed");
    } else {
      results.push(...(data.images || data.videos || []));
    }
    batch = [];
    batchBytes = 0;
  }

  for (const file of files) {
    if (batch.length && batchBytes + file.size > maxBatchBytes) {
      await flush();
    }
    batch.push(file);
    batchBytes += file.size;
  }
  await flush();

  return { results, errors };
}
