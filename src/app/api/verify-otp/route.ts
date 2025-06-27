// app/api/verify-otp/route.ts

import User from "@/model/user";
import dbConnect from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  await dbConnect();

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const allowed = rateLimit(ip, 5, 3000); // 5 requests per 3 seconds

  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many OTP attempts. Please try again later.",
      },
      { status: 429 }
    );
  }

  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json(
      { success: false, message: "Email and OTP are required." },
      { status: 400 }
    );
  }

  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || new Date(user.otpExpiry) < new Date()) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired OTP" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, message: "OTP verified" });
}
