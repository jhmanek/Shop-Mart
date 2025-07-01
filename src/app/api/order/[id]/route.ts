import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Order from "@/model/order";
import { authenticate } from "@/lib/authentication";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context; // ✅ correctly handled
    const user = await authenticate(req);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const order = await Order.findById(params.id);

    if (!order)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    if (order.status === "cancelled" || order.status === "delivered")
      return NextResponse.json(
        { message: "Cannot cancel this order" },
        { status: 400 }
      );

    order.status = "cancelled";
    await order.save();

    return NextResponse.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Order cancel error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
