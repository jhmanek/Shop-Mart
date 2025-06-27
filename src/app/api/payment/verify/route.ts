import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { rateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  // Rate limiting per IP
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const allowed = rateLimit(ip, 5, 3000); // 5 req per 3 seconds

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "Too many verification attempts. Please wait." },
      { status: 429 }
    );
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    await req.json();

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return NextResponse.json(
      { success: false, error: "Missing payment data." },
      { status: 400 }
    );
  }

  const secret = process.env.RAZORPAY_SECRET_KEY!;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    return NextResponse.json({ success: true, paymentId: razorpay_payment_id });
  } else {
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 400 }
    );
  }
}
