import mongoose from "mongoose";

declare global {
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached!.conn) return cached!.conn;

  const MONGODB_URI = process.env.MONGODB_URI as string | undefined;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }

  if (!cached!.promise) {
    cached!.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: process.env.MONGODB_DB || undefined,
      })
      .then((m) => m);
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}
