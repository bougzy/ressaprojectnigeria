import { SignJWT, jwtVerify } from "jose";

// Hardcoded so admin sessions work identically everywhere (local, Vercel,
// any host) without requiring any environment variable setup. If you ever
// want to invalidate all existing admin sessions at once, change this
// string and redeploy.
const secret = new TextEncoder().encode(
  "ressa-project-nigeria-admin-session-secret-2024-do-not-share"
);

export const COOKIE_NAME = "ressa_admin";

export async function createSession(username) {
  return await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

// Hardcoded admin login — intentionally not read from environment variables,
// so the dashboard works the same everywhere (locally and on Vercel) without
// any env var setup, and can't accidentally be overridden by a stray/typo'd
// ADMIN_USERNAME or ADMIN_PASSWORD value on the hosting platform.
//
// To change the password, edit these two constants directly and redeploy.
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Ressa@2024";

export function checkCredentials(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
