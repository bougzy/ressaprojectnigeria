import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Message } from "@/lib/models";

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.name || !body.message) {
      return NextResponse.json(
        { error: "Name and message are required." },
        { status: 400 }
      );
    }
    await dbConnect();
    await Message.create({
      name: body.name,
      email: body.email || "",
      phone: body.phone || "",
      subject: body.subject || "",
      message: body.message,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("contact error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
