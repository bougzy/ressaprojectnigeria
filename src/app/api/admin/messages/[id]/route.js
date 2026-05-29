import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Message } from "@/lib/models";

export async function PATCH(req, { params }) {
  await dbConnect();
  const body = await req.json();
  const doc = await Message.findByIdAndUpdate(
    params.id,
    { read: !!body.read },
    { new: true }
  ).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...doc, _id: doc._id.toString() });
}

export async function DELETE(req, { params }) {
  await dbConnect();
  await Message.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
