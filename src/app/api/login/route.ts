import { NextRequest, NextResponse } from "next/server";
import connection from "@/lib/mongoose";
import User from "@/model/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  await connection();

  // IP-based limiter
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const allowed = rateLimit(ip, 5, 60000);

  if (!allowed) {
    return NextResponse.json(
      { message: "Too many login attempts. Please wait and try again." },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await req.json();
    console.log("Login attempt for email:", email);

    if (!email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Determine role from DB or ENV
    let role = user.role;
    const adminEmail = process.env.ADMIN_EMAIL;
    if (email === adminEmail) {
      role = "admin";
    }

    const secret =
      role === "admin"
        ? process.env.JWT_ADMIN_SECRET
        : process.env.JWT_USER_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not defined for role:", role);
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role,
      },
      secret,
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: error.message },
      { status: 500 }
    );
  }
}
