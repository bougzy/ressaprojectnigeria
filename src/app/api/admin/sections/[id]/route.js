import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Section } from "@/lib/models";

const ALLOWED = [
  "type",
  "order",
  "visible",
  "bg",
  "eyebrow",
  "title",
  "subtitle",
  "body",
  "image",
  "imagePosition",
  "ctaText",
  "ctaHref",
  "ctaText2",
  "ctaHref2",
  "galleryCategory",
  "galleryLimit",
  "videoLimit",
  "items",
];

export async function PATCH(req, { params }) {
  await dbConnect();
  const body = await req.json();
  const update = {};
  for (const k of ALLOWED) if (k in body) update[k] = body[k];
  const doc = await Section.findByIdAndUpdate(params.id, update, {
    new: true,
  }).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...doc, _id: doc._id.toString() });
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const doc = await Section.findByIdAndDelete(params.id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
