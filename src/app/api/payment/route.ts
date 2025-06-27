import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { rateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  // IP-based rate limit
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const allowed = rateLimit(ip, 5, 3000); // 5 requests per 3 seconds

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many payment attempts. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const { amount } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount provided." },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_SECRET_KEY!,
    });

    const options = {
      amount: Math.round(amount * 100), // amount in paisa
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ order });
  } catch (error) {
    console.error("Razorpay order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
