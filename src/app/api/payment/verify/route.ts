import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    await req.json();

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
