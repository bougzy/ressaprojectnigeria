import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { writeFile, readFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import ffmpegPath from "ffmpeg-static";
import { dbConnect } from "@/lib/mongodb";
import { GalleryImage, Video } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Video compression needs more than the default 10s — give ffmpeg room to
// work. (Requires a Vercel plan whose function-duration limit covers this;
// on a plan capped below 60s, compression of longer clips may time out —
// trimming the clip shorter before upload avoids that.)
export const maxDuration = 60;

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
 * Every video is transcoded through the same ffmpeg pipeline before
 * storage (see compressVideo() below) — same resolution cap, same
 * bitrate — so any video added anywhere on the site (including "Our
 * Conferences" and any future video section) ends up a consistent size
 * and file weight, regardless of the source phone/camera it came from.
 *
 * Fields:
 *   kind       "image" (default), "video", or "audio"
 *   files      one or more files (multiple selection supported)
 *   file       single file — kept for backward compatibility
 *   replaceId  if present, replaces that image's file in place instead of
 *              creating a new record (used by "change image")
 *   category, year, alt, caption, featured   image metadata (applied to
 *              every file in the batch)
 *   title, description                        video metadata
 *
 * Because the request body has to fit within the hosting platform's
 * per-request size limit (~4.5MB on Vercel, regardless of what happens
 * to the file afterward), each file is capped and the client is expected
 * to send large batches as several smaller requests (see
 * src/lib/clientMedia.js — this is handled automatically for the admin,
 * not something they need to think about). Compression happens *after*
 * the file is received, so it reduces what's stored and streamed to
 * visitors, but can't raise how large a single upload can be.
 */

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // per image, after client-side compression
const MAX_VIDEO_BYTES = 4.5 * 1024 * 1024; // Vercel's own inbound request-body ceiling
const MAX_AUDIO_BYTES = 8 * 1024 * 1024; // per audio track

// Every uploaded video is transcoded to this same shape: max 480px on
// its longer side, modest bitrate, mono audio. Keeps every clip in "Our
// Conferences" (or any other video slider) a consistent, predictable
// file weight no matter what the admin's phone recorded it at.
async function compressVideo(inputBuffer) {
  const inPath = join(tmpdir(), `up-${randomUUID()}.input`);
  const outPath = join(tmpdir(), `up-${randomUUID()}.mp4`);
  await writeFile(inPath, inputBuffer);
  try {
    await new Promise((resolve, reject) => {
      const args = [
        "-y",
        "-i", inPath,
        "-vf", "scale='min(480,iw)':'min(480,ih)':force_original_aspect_ratio=decrease",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "30",
        "-maxrate", "700k",
        "-bufsize", "1400k",
        "-c:a", "aac",
        "-b:a", "80k",
        "-ac", "1",
        "-movflags", "+faststart",
        outPath,
      ];
      const proc = spawn(ffmpegPath, args);
      let stderr = "";
      proc.stderr.on("data", (d) => { stderr += d.toString(); });
      proc.on("error", reject);
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-500)}`));
      });
    });
    return await readFile(outPath);
  } finally {
    await unlink(inPath).catch(() => {});
    await unlink(outPath).catch(() => {});
  }
}

function toDataUri(mime, bytes) {
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

function titleFromFilename(name) {
  return (name || "Untitled").replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim();
}

export async function POST(req) {
  try {
    const form = await req.formData();
    await dbConnect();

    const kind =
      form.get("kind") === "video"
        ? "video"
        : form.get("kind") === "audio"
        ? "audio"
        : "image";
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
      prev.src = toDataUri(singleFile.type || "image/jpeg", bytes);
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

    /* ---------------- Create a single audio track (no DB record — the
       caller stores the returned data URI directly on a Section, e.g. the
       RESSA Anthem block) ---------------- */
    if (kind === "audio") {
      const file = list[0];
      const bytes = Buffer.from(await file.arrayBuffer());
      if (bytes.length > MAX_AUDIO_BYTES) {
        return NextResponse.json(
          { error: `That audio file is too large (max ${MAX_AUDIO_BYTES / (1024 * 1024)}MB).` },
          { status: 400 }
        );
      }
      return NextResponse.json({ audioSrc: toDataUri(file.type || "audio/mpeg", bytes) });
    }

    /* ---------------- Create video record(s) ---------------- */
    if (kind === "video") {
      const description = form.get("description") || "";
      const created = [];
      for (const file of list) {
        const raw = Buffer.from(await file.arrayBuffer());
        if (raw.length > MAX_VIDEO_BYTES) {
          return NextResponse.json(
            {
              error: `"${file.name}" is too large to upload (max ${(
                MAX_VIDEO_BYTES / (1024 * 1024)
              ).toFixed(1)}MB — this is a hosting platform limit, compression happens after upload so it can't work around it). Trim the clip shorter, or paste a YouTube link instead. Created ${created.length} of ${list.length} video(s) before this one failed.`,
            },
            { status: 400 }
          );
        }
        let compressed;
        try {
          compressed = await compressVideo(raw);
        } catch (err) {
          console.error("video compression failed", err);
          return NextResponse.json(
            {
              error: `Couldn't process "${file.name}" — the file may be corrupted or in an unsupported format. Created ${created.length} of ${list.length} video(s) before this one failed.`,
            },
            { status: 400 }
          );
        }
        const doc = await Video.create({
          title: form.get("title") || titleFromFilename(file.name),
          url: toDataUri("video/mp4", compressed),
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
        src: toDataUri(file.type || "image/jpeg", bytes),
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
