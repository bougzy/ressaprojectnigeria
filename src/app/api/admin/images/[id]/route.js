import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { dbConnect } from "@/lib/mongodb";
import { GalleryImage } from "@/lib/models";

// Update an image's metadata or replace its src
export async function PATCH(req, { params }) {
  await dbConnect();
  const body = await req.json();
  const allowed = ["src", "alt", "caption", "category", "year", "order", "featured"];
  const update = {};
  for (const k of allowed) if (k in body) update[k] = body[k];
  const doc = await GalleryImage.findByIdAndUpdate(params.id, update, {
    new: true,
  }).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...doc, _id: doc._id.toString() });
}

// Delete an image (DB record + the underlying file if it lives in /public)
export async function DELETE(req, { params }) {
  await dbConnect();
  const doc = await GalleryImage.findByIdAndDelete(params.id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Best-effort delete of the physical file when it is a local upload.
  if (doc.src && doc.src.startsWith("/images/")) {
    try {
      const fp = path.join(process.cwd(), "public", doc.src);
      await fs.unlink(fp);
    } catch {
      /* file may be shared/missing — ignore */
    }
  }
  return NextResponse.json({ ok: true });
}
