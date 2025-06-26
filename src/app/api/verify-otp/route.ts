// app/api/verify-otp/route.ts

import User from "@//model/user";
import dbConnect from "@//lib/mongoose";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const { email, otp } = await req.json();

  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || new Date(user.otpExpiry) < new Date()) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired OTP" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, message: "OTP verified" });
}
