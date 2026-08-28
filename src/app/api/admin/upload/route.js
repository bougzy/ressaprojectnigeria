import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { dbConnect } from "@/lib/mongodb";
import { GalleryImage } from "@/lib/models";

export const runtime = "nodejs";

/**
 * Handles a multipart/form-data upload:
 *   file      (required)  the image or video
 *   category, year, alt, caption, featured  (optional metadata)
 *   replaceId (optional)  if present, replaces that image's src instead of
 *                         creating a new record (used by "change image").
 *   noRecord  (optional)  if "true", just saves the file and returns its src
 *                         without creating a GalleryImage DB record — used
 *                         when a section (e.g. a carousel/card list) will
 *                         store the src directly in its own items array.
 * Saves the file into /public/images and (usually) creates/updates the DB
 * record.
 *
 * NOTE: on Vercel, serverless functions have a request body size limit
 * (a few MB). Small images upload fine; larger video files may fail with
 * a 413 — paste a YouTube link instead for anything sizeable.
 */
export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const isVideo =
      (file.type || "").startsWith("video/") ||
      /\.(mp4|webm|mov|m4v|avi|mkv|ogg)$/i.test(file.name || "");
    const bytes = Buffer.from(await file.arrayBuffer());
    const safeBase = (file.name || (isVideo ? "upload.mp4" : "upload.jpg"))
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-");
    // Unique-ish name without Date.now (avoid collisions via random suffix)
    const rand = Math.round(performance.now() % 100000);
    const filename = `up-${rand}-${safeBase}`;
    const dir = path.join(process.cwd(), "public", "images");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), bytes);
    const src = `/images/${filename}`;

    if (form.get("noRecord") === "true") {
      return NextResponse.json({ src, kind: isVideo ? "video" : "image" });
    }

    await dbConnect();
    const replaceId = form.get("replaceId");

    if (replaceId) {
      const prev = await GalleryImage.findById(replaceId);
      if (prev) {
        // remove the old physical file if local
        if (prev.src?.startsWith("/images/")) {
          try {
            await fs.unlink(path.join(process.cwd(), "public", prev.src));
          } catch {}
        }
        prev.src = src;
        if (form.get("alt")) prev.alt = form.get("alt");
        if (form.get("caption")) prev.caption = form.get("caption");
        await prev.save();
        return NextResponse.json({
          ...prev.toObject(),
          _id: prev._id.toString(),
        });
      }
    }

    const doc = await GalleryImage.create({
      src,
      alt: form.get("alt") || "",
      caption: form.get("caption") || "",
      category: form.get("category") || "event",
      year: form.get("year") || "",
      order: 999,
      featured: form.get("featured") === "true",
    });
    return NextResponse.json({
      ...doc.toObject(),
      _id: doc._id.toString(),
      kind: isVideo ? "video" : "image",
    });
  } catch (e) {
    console.error("upload error", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
