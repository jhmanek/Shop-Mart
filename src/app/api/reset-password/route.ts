// app/api/reset-password/route.ts
import User from "@/model/user";
import dbConnect from "@/lib/mongoose";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  await dbConnect();

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const allowed = rateLimit(ip, 5, 3000); // 5 requests / 3 seconds

  if (!allowed) {
    return NextResponse.json(
      { success: false, message: "Too many reset attempts. Try again later." },
      { status: 429 }
    );
  }

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Email and password are required." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.findOneAndUpdate(
    { email },
    { password: hashedPassword, otp: null, otpExpiry: null }
  );

  if (!user) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Password reset successfully",
  });
}
