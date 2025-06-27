import { NextRequest, NextResponse } from "next/server";
import connection from "@/lib/mongoose";
import User from "@/model/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  await connection();

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const allowed = rateLimit(ip, 5, 60000); // 5 requests per 3 seconds

  if (!allowed) {
    return NextResponse.json(
      { message: "Too many signup attempts. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const { name, email, password, mobile } = await req.json();

    if (!name || !email || !password || !mobile) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      role: "user",
    });

    await newUser.save();

    const secret = process.env.JWT_USER_SECRET;
    if (!secret) {
      console.error("JWT_USER_SECRET is missing");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const token = jwt.sign({ userId: newUser._id, role: "user" }, secret, {
      expiresIn: "7d",
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        token,
        user: {
          name: newUser.name,
          email: newUser.email,
          role: "user",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
