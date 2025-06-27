import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/authentication";
import User from "@/model/user";
import { rateLimit } from "@/lib/rateLimiter";

export async function GET(req: NextRequest) {
  const user: any = await authenticate(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allowed = rateLimit(user._id.toString(), 5, 3000);
  if (!allowed) {
    return NextResponse.json(
      { message: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const userData = await User.findById(user._id).select("-password");
    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(userData, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch user", error: err },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const user: any = await authenticate(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allowed = rateLimit(user._id.toString(), 5, 3000);
  if (!allowed) {
    return NextResponse.json(
      { message: "Too many update attempts. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const allowedFields = ["name", "mobile"];
    const updates: Partial<Record<string, any>> = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updates, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Update failed", error: err },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const user: any = await authenticate(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allowed = rateLimit(user._id.toString(), 5, 3000);
  if (!allowed) {
    return NextResponse.json(
      { message: "Too many delete attempts. Please wait a few seconds." },
      { status: 429 }
    );
  }

  try {
    const deletedUser = await User.findByIdAndDelete(user._id);
    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { message: "Deletion failed", error: err },
      { status: 500 }
    );
  }
}
