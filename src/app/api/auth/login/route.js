import { NextResponse } from "next/server";
import { checkCredentials, createSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req) {
  const { username, password } = await req.json().catch(() => ({}));

  if (!checkCredentials(username, password)) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  const token = await createSession(username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
