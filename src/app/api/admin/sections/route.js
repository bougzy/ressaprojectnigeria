import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Section } from "@/lib/models";
import { DEFAULT_SECTIONS } from "@/lib/defaults";

export const dynamic = "force-dynamic";

// List all sections for a page (default "home"), including hidden ones.
// Seeds the DB with the built-in defaults on first load so the admin has
// something to edit immediately.
export async function GET(req) {
  await dbConnect();
  const page = req.nextUrl.searchParams.get("page") || "home";
  let rows = await Section.find({ page }).sort({ order: 1, createdAt: 1 }).lean();
  if (!rows.length && page === "home") {
    await Section.insertMany(DEFAULT_SECTIONS.map((s) => ({ ...s, page: "home" })));
    rows = await Section.find({ page }).sort({ order: 1, createdAt: 1 }).lean();
  }
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
    ctaText: body.ctaText || "",
    ctaHref: body.ctaHref || "",
    ctaText2: body.ctaText2 || "",
    ctaHref2: body.ctaHref2 || "",
    galleryCategory: body.galleryCategory || "",
    galleryLimit: body.galleryLimit ?? 8,
    videoLimit: body.videoLimit ?? 2,
    items: body.items ?? [],
  });
  return NextResponse.json({ ...doc.toObject(), _id: doc._id.toString() });
}
