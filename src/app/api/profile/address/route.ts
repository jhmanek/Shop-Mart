import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/model/user";
import { authenticate } from "@/lib/authentication";
import { rateLimit } from "@/lib/rateLimiter";

// ✅ GET: Fetch user's address
export async function GET(req: NextRequest) {
  await connectDB();
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

  const dbUser = await User.findById(user._id).select("address");
  return NextResponse.json({ address: dbUser?.address || "" });
}

// ✅ PATCH: Update address (only for users)
export async function PATCH(req: NextRequest) {
  await connectDB();
  const user: any = await authenticate(req);

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allowed = rateLimit(user._id.toString(), 5, 3000);
  if (!allowed) {
    return NextResponse.json(
      { message: "Too many updates. Please wait a moment." },
      { status: 429 }
    );
  }

  if (user.role !== "user") {
    return NextResponse.json(
      { message: "Admins cannot edit address" },
      { status: 403 }
    );
  }

  const { address } = await req.json();

  if (!address || address.trim() === "") {
    return NextResponse.json(
      { message: "Address is required" },
      { status: 400 }
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { address },
    { new: true }
  ).select("name email mobile address");

  if (!updatedUser) {
    return NextResponse.json(
      { message: "User not found or update failed" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Address updated successfully",
    user: updatedUser,
  });
}

// ✅ DELETE: Remove address (only for users)
export async function DELETE(req: NextRequest) {
  await connectDB();
  const user: any = await authenticate(req);

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const allowed = rateLimit(user._id.toString(), 5, 3000);
  if (!allowed) {
    return NextResponse.json(
      { message: "Too many delete attempts. Please slow down." },
      { status: 429 }
    );
  }

  if (user.role !== "user") {
    return NextResponse.json(
      { message: "Admins cannot delete address" },
      { status: 403 }
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { address: "" },
    { new: true }
  );

  return NextResponse.json({
    message: "Address deleted successfully",
    user: updatedUser,
  });
}
