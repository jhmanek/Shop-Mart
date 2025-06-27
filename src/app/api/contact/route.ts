import { NextRequest, NextResponse } from "next/server";
import connection from "@/lib/mongoose";
import Contact from "@/model/contact";
import { rateLimit } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  await connection();

  // Get IP (fallback to "unknown" if not found)
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  const allowed = rateLimit(ip, 5, 3000); // 5 requests per 3 seconds
  if (!allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    return NextResponse.json(
      { message: "Message sent successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving contact message:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "GET method not allowed on /api/contact" },
    { status: 405 }
  );
}
