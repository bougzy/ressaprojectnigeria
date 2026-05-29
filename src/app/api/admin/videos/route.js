import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Video } from "@/lib/models";

export const dynamic = "force-dynamic";

function normalizeYouTube(url) {
  if (!url) return url;
  // Convert common watch/share links to embeddable form
  const watch = url.match(/[?&]v=([\w-]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  const short = url.match(/youtu\.be\/([\w-]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  return url;
}

export async function GET() {
  await dbConnect();
  const vids = await Video.find({}).sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json(vids.map((v) => ({ ...v, _id: v._id.toString() })));
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  if (!body.title || !body.url)
    return NextResponse.json(
      { error: "title and url are required" },
      { status: 400 }
    );
  const doc = await Video.create({
    title: body.title,
    url: normalizeYouTube(body.url),
    description: body.description || "",
    order: body.order ?? 999,
  });
  return NextResponse.json({ ...doc.toObject(), _id: doc._id.toString() });
}
