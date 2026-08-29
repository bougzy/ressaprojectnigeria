import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { GalleryImage, Video } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Handles multipart/form-data uploads of local files picked from an
 * admin's device (images or short video clips).
 *
 * Files are stored as base64 data URIs directly on the MongoDB document
 * (in `src` for images, `url` for videos) rather than written to disk.
 * Vercel's serverless functions have a read-only filesystem in
 * production, so writing to /public would silently fail there — storing
 * in the database works identically in local dev and in production, with
 * no extra storage service to configure.
 *
 * Fields:
 *   kind       "image" (default) or "video"
 *   files      one or more files (multiple selection supported)
 *   file       single file — kept for backward compatibility
 *   replaceId  if present, replaces that image's file in place instead of
 *              creating a new record (used by "change image")
 *   category, year, alt, caption, featured   image metadata (applied to
 *              every file in the batch)
 *   title, description                        video metadata
 *
 * Because the request body has to fit within the hosting platform's
 * per-request size limit, each file is capped and the client is expected
 * to send large batches as several smaller requests (see
 * src/lib/clientMedia.js — this is handled automatically for the admin,
 * not something they need to think about).
 */

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // per image, after client-side compression
const MAX_VIDEO_BYTES = 4 * 1024 * 1024; // per video — short clips only; use a YouTube link for anything longer

function toDataUri(file, bytes) {
  const mime = file.type || "application/octet-stream";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

function titleFromFilename(name) {
  return (name || "Untitled").replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim();
}

export async function POST(req) {
  try {
    const form = await req.formData();
    await dbConnect();

    const kind = form.get("kind") === "video" ? "video" : "image";
    const replaceId = form.get("replaceId");
    const singleFile = form.get("file");

    /* ---------------- Replace an existing image's file in place ---------------- */
    if (replaceId && singleFile && typeof singleFile !== "string") {
      const bytes = Buffer.from(await singleFile.arrayBuffer());
      if (bytes.length > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: `That image is too large (max ${MAX_IMAGE_BYTES / (1024 * 1024)}MB).` },
          { status: 400 }
        );
      }
      const prev = await GalleryImage.findById(replaceId);
      if (!prev) return NextResponse.json({ error: "Not found" }, { status: 404 });
      prev.src = toDataUri(singleFile, bytes);
      if (form.get("alt")) prev.alt = form.get("alt");
      if (form.get("caption")) prev.caption = form.get("caption");
      await prev.save();
      return NextResponse.json({ ...prev.toObject(), _id: prev._id.toString() });
    }

    /* ---------------- Gather the file(s) to create ---------------- */
    const multi = form.getAll("files").filter((f) => typeof f !== "string");
    const list = multi.length
      ? multi
      : singleFile && typeof singleFile !== "string"
      ? [singleFile]
      : [];
    if (!list.length) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    /* ---------------- Create video record(s) ---------------- */
    if (kind === "video") {
      const description = form.get("description") || "";
      const created = [];
      for (const file of list) {
        const bytes = Buffer.from(await file.arrayBuffer());
        if (bytes.length > MAX_VIDEO_BYTES) {
          return NextResponse.json(
            {
              error: `"${file.name}" is too large (max ${
                MAX_VIDEO_BYTES / (1024 * 1024)
              }MB for an uploaded clip). For longer videos, paste a YouTube link instead — created ${created.length} of ${list.length} video(s) before this one failed.`,
            },
            { status: 400 }
          );
        }
        const doc = await Video.create({
          title: form.get("title") || titleFromFilename(file.name),
          url: toDataUri(file, bytes),
          description,
          order: 999,
        });
        created.push({ ...doc.toObject(), _id: doc._id.toString() });
      }
      return NextResponse.json({ videos: created });
    }

    /* ---------------- Create image record(s) ---------------- */
    const category = form.get("category") || "event";
    const year = form.get("year") || "";
    const altBase = form.get("alt") || "";
    const caption = form.get("caption") || "";
    const featured = form.get("featured") === "true";

    const created = [];
    for (const file of list) {
      const bytes = Buffer.from(await file.arrayBuffer());
      if (bytes.length > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          {
            error: `"${file.name}" is too large (max ${
              MAX_IMAGE_BYTES / (1024 * 1024)
            }MB). Uploaded ${created.length} of ${list.length} image(s) before this one failed.`,
          },
          { status: 400 }
        );
      }
      const doc = await GalleryImage.create({
        src: toDataUri(file, bytes),
        alt: altBase || titleFromFilename(file.name),
        caption,
        category,
        year,
        order: 999,
        featured,
      });
      created.push({ ...doc.toObject(), _id: doc._id.toString() });
    }
    return NextResponse.json({ images: created });
  } catch (e) {
    console.error("upload error", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
