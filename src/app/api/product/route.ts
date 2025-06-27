import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/model/products";
import connectDB from "@/lib/mongoose";
import { rateLimit } from "@/lib/rateLimiter";

export async function GET(req: NextRequest) {
  // IP-based rate limiter
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const allowed = rateLimit(ip, 5, 3000); // 5 requests per 3 seconds

  if (!allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  await connectDB();
  const products = await Product.find();
  return NextResponse.json(products);
}
