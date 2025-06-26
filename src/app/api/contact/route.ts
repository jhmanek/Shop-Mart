import { NextRequest, NextResponse } from "next/server";
import connection from "@//lib/mongoose"; // your MongoDB connection function
import Contact from "@//model/contact"; // your Mongoose Contact model

export async function POST(req: NextRequest) {
  await connection();

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
