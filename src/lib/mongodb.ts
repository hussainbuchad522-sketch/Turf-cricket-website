import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

const cached = (global as Record<string, unknown>)._mongoose as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} | undefined;

const mongoCache = cached ?? { conn: null, promise: null };
(global as Record<string, unknown>)._mongoose = mongoCache;

export async function connectDB() {
  if (mongoCache.conn) return mongoCache.conn;

  if (!mongoCache.promise) {
    mongoCache.promise = mongoose.connect(MONGODB_URI);
  }

  try {
    mongoCache.conn = await mongoCache.promise;
    return mongoCache.conn;
  } catch (error) {
    // Clear the failed promise so the next call retries instead of reusing a broken connection
    mongoCache.promise = null;
    throw error;
  }
}
