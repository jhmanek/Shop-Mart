import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/model/products";
import connectDB from "@/lib/mongoose";
import { isAdmin } from "@/lib/authentication";
import mongoose from "mongoose";
import { rateLimit } from "@/lib/rateLimiter";

// Optional Rate Limiter Utility
// const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
// const rateLimit = (ip: string, limit: number, interval: number) => {
//   const now = Date.now();
//   const entry = rateLimitMap.get(ip) || { count: 0, timestamp: now };
//   if (now - entry.timestamp < interval) {
//     if (entry.count >= limit) return false;
//     entry.count++;
//   } else {
//     entry.count = 1;
//     entry.timestamp = now;
//   }
//   rateLimitMap.set(ip, entry);
//   return true;
// };

export async function GET(req: NextRequest) {
  await connectDB();
  const user = await isAdmin(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const products = await Product.find();
    return NextResponse.json(products); // ✅ return just array!
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  const user = await isAdmin(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip, 10, 3000))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const data = await req.json();
    if (!data.title || typeof data.price !== "number") {
      return NextResponse.json(
        { error: "Title and price are required" },
        { status: 400 }
      );
    }
    const product = await Product.create(data);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const user = await isAdmin(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip, 10, 3000))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const { id } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid Product ID" },
        { status: 400 }
      );
    }
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  await connectDB();
  const user = await isAdmin(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip, 10, 3000))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const { id, ...updateData } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid Product ID" },
        { status: 400 }
      );
    }
    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const user = await isAdmin(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip, 10, 3000))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const { id, title, price, image, category } = await req.json();
    if (!id || !title || typeof price !== "string" || !image || !category) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid Product ID" },
        { status: 400 }
      );
    }
    const updated = await Product.findByIdAndUpdate(
      id,
      { title, price, image, category },
      { new: true, runValidators: true, overwrite: true }
    );
    if (!updated)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
