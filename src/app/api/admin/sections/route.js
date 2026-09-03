import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Section } from "@/lib/models";
import { ensureHomeSectionsSeeded } from "@/lib/content";
import { normalizeYouTube } from "@/lib/youtube";

export const dynamic = "force-dynamic";

// List all sections for a page (default "home"), including hidden ones.
// Seeds the DB with the built-in defaults on first load (and back-fills any
// new default sections added in an update) so the admin always has
// something sensible to edit, without ever resetting their customisations.
export async function GET(req) {
  await dbConnect();
  const page = req.nextUrl.searchParams.get("page") || "home";
  if (page === "home") await ensureHomeSectionsSeeded();
  const rows = await Section.find({ page }).sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json(rows.map((r) => ({ ...r, _id: r._id.toString() })));
}

function slugify(str) {
  return (str || "section")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

// Create a new section. Body: { type, page?, title?, ...any other field }
export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  if (!body.type)
    return NextResponse.json({ error: "type is required" }, { status: 400 });

  const page = body.page || "home";
  const count = await Section.countDocuments({ page });
  let baseKey = slugify(body.key || body.title || body.type);
  let key = baseKey || `section-${Date.now()}`;
  let n = 1;
  while (await Section.findOne({ key })) {
    key = `${baseKey}-${++n}`;
  }

  const rawItems = body.items ?? [];
  const items = Array.isArray(rawItems)
    ? rawItems.map((it) =>
        it && it.type === "video" ? { ...it, src: normalizeYouTube(it.src) } : it
      )
    : rawItems;

  const doc = await Section.create({
    key,
    type: body.type,
    page,
    order: body.order ?? count,
    visible: body.visible ?? true,
    bg: body.bg || "white",
    eyebrow: body.eyebrow || "",
    title: body.title || "",
    subtitle: body.subtitle || "",
    body: body.body || "",
    image: body.image || "",
    imagePosition: body.imagePosition || "right",
    audioSrc: body.audioSrc || "",
    ctaText: body.ctaText || "",
    ctaHref: body.ctaHref || "",
    ctaText2: body.ctaText2 || "",
    ctaHref2: body.ctaHref2 || "",
    galleryCategory: body.galleryCategory || "",
    galleryLimit: body.galleryLimit ?? 8,
    videoLimit: body.videoLimit ?? 2,
    items,
  });
  return NextResponse.json({ ...doc.toObject(), _id: doc._id.toString() });
}
