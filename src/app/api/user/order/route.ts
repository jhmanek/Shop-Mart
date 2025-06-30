import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/authentication";
import Order from "@/model/order";

export async function GET(req: NextRequest) {
  const user: any = await authenticate(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .select(
        "items totalAmount address paymentStatus orderStatus createdAt estimatedDelivery"
      );
    // .select("-__v");

    return NextResponse.json(orders, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch orders", error: err },
      { status: 500 }
    );
  }
}
