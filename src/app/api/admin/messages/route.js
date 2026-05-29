import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Message } from "@/lib/models";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const msgs = await Message.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(msgs.map((m) => ({ ...m, _id: m._id.toString() })));
}
