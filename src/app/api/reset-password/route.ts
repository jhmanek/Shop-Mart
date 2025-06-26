// app/api/reset-password/route.ts
import User from "@//model/user";
import dbConnect from "@//lib/mongoose";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const { email, password } = await req.json();

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
