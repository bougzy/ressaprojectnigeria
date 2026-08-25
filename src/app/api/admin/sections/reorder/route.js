import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Section } from "@/lib/models";

// Body: { order: [{ id, order }, ...] }
export async function PATCH(req) {
  await dbConnect();
  const { order } = await req.json();
  if (!Array.isArray(order))
    return NextResponse.json({ error: "order[] required" }, { status: 400 });

  await Promise.all(
    order.map((o) => Section.findByIdAndUpdate(o.id, { order: o.order }))
  );
  return NextResponse.json({ ok: true });
}
