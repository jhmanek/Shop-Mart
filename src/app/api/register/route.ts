import { NextRequest, NextResponse } from "next/server";
import connection from "@/lib/mongoose";
import User from "@/model/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  await connection();

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

    // 🧠 Default role is "user" unless specified
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      role: "user", // explicitly set role (optional if your schema already does)
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
