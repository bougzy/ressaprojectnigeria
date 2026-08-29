import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { GalleryImage } from "@/lib/models";
import { ensureExtraImagesSeeded } from "@/lib/content";

export const dynamic = "force-dynamic";

// List all images
export async function GET() {
  await dbConnect();
  await ensureExtraImagesSeeded();
  const imgs = await GalleryImage.find({}).sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json(
    imgs.map((i) => ({ ...i, _id: i._id.toString() }))
  );
}

// Create a new image record (src already uploaded or external URL)
export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  if (!body.src)
    return NextResponse.json({ error: "src is required" }, { status: 400 });
  const doc = await GalleryImage.create({
    src: body.src,
    alt: body.alt || "",
    caption: body.caption || "",
    category: body.category || "event",
    year: body.year || "",
    order: body.order ?? 999,
    featured: !!body.featured,
  });
  return NextResponse.json({ ...doc.toObject(), _id: doc._id.toString() });
}
