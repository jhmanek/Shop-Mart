import mongoose from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseGlobal: GlobalMongoose;
}

if (!global.mongooseGlobal) {
  global.mongooseGlobal = { conn: null, promise: null };
}

async function connection() {
  if (global.mongooseGlobal.conn) {
    return global.mongooseGlobal.conn;
  }

  if (!global.mongooseGlobal.promise) {
    global.mongooseGlobal.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongoose) => {
        console.log("MongoDB connected");
        return mongoose;
      });
  }

  global.mongooseGlobal.conn = await global.mongooseGlobal.promise;
  return global.mongooseGlobal.conn;
}

export default connection;
