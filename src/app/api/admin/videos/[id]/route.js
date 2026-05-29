import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Video } from "@/lib/models";

export async function PATCH(req, { params }) {
  await dbConnect();
  const body = await req.json();
  const update = {};
  for (const k of ["title", "url", "description", "order"])
    if (k in body) update[k] = body[k];
  const doc = await Video.findByIdAndUpdate(params.id, update, {
    new: true,
  }).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...doc, _id: doc._id.toString() });
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const doc = await Video.findByIdAndDelete(params.id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
