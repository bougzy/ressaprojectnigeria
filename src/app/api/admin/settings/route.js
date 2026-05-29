import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Setting } from "@/lib/models";
import { DEFAULT_SETTINGS } from "@/lib/defaults";

export const dynamic = "force-dynamic";

// Return merged settings (defaults + DB overrides)
export async function GET() {
  await dbConnect();
  const rows = await Setting.find({}).lean();
  const fromDb = {};
  for (const r of rows) fromDb[r.key] = r.value;
  return NextResponse.json({ ...DEFAULT_SETTINGS, ...fromDb });
}

// Upsert one or many settings: body can be { key, value } or { settings: {...} }
export async function PATCH(req) {
  await dbConnect();
  const body = await req.json();

  const entries =
    body.settings && typeof body.settings === "object"
      ? Object.entries(body.settings)
      : body.key
        ? [[body.key, body.value]]
        : [];

  if (entries.length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  await Promise.all(
    entries.map(([key, value]) =>
      Setting.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
      )
    )
  );

  const rows = await Setting.find({}).lean();
  const fromDb = {};
  for (const r of rows) fromDb[r.key] = r.value;
  return NextResponse.json({ ...DEFAULT_SETTINGS, ...fromDb });
}
