import mongoose from "mongoose";

// Falls back to the project's MongoDB Atlas cluster if MONGODB_URI isn't set
// in the environment (e.g. on Vercel), so no manual env var setup is required.
// You can still override this by setting MONGODB_URI in Vercel's project
// settings — that will always take precedence over this default.
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://stockpulse:stockpulse@stockpulse.k7rlq2w.mongodb.net/stockpulse";

/**
 * Cached connection across hot-reloads in dev and across lambda invocations.
 */
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
