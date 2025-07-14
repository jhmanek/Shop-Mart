// import Razorpay from "razorpay";
// import connectDB from "@/lib/mongoose";
// import Order from "@/model/order";
// import { NextResponse } from "next/server";

// const razorpay = new Razorpay({
//   key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_SECRET_KEY!,
// });

// export async function POST(req: Request, context: { params: { id: string } }) {
//   await connectDB();

//   const { id } = await context.params;

//   try {
//     const order = await Order.findById(id);

//     if (!order || order.paymentStatus !== "paid") {
//       return NextResponse.json(
//         { error: "Only paid orders can be refu nded" },
//         { status: 400 }
//       );
//     }

//     console.log("Refunding payment ID:", order.paymentId);

//     const refund = await razorpay.payments.refund(order.paymentId, {});

//     order.refundId = refund.id;
//     order.paymentStatus = "refunded";
//     order.orderStatus = "cancelled";
//     await order.save();

//     return NextResponse.json({ message: "Refund success", refund });
//   } catch (error: any) {
//     console.error("Refund Error:", JSON.stringify(error, null, 2));
//     return NextResponse.json(
//       { error: error?.error?.description || "Refund failed" },
//       { status: 500 }
//     );
//   }
// }

import Razorpay from "razorpay";
import connectDB from "@/lib/mongoose";
import Order from "@/model/order";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET_KEY!,
});

export async function POST(req: Request, context: { params: { id: string } }) {
  await connectDB();

  const { id } = context.params;

  try {
    const order = await Order.findById(id);

    if (!order || order.paymentStatus !== "paid") {
      return NextResponse.json(
        { error: "Only paid orders can be refunded" },
        { status: 400 }
      );
    }

    if (!order.paymentId) {
      return NextResponse.json(
        { error: "Missing payment ID for this order" },
        { status: 400 }
      );
    }

    const amountInPaisa = Math.round(Number(order.totalAmount) * 100);
    console.log("Refunding payment ID:", order.paymentId);
    console.log("Refund Amount (paisa):", amountInPaisa);

    if (!amountInPaisa || isNaN(amountInPaisa)) {
      return NextResponse.json(
        { error: "Invalid refund amount" },
        { status: 400 }
      );
    }

    const refund = await razorpay.payments.refund(order.paymentId, {
      amount: amountInPaisa,
    });

    order.refundId = refund.id;
    order.paymentStatus = "refunded";
    order.orderStatus = "cancelled";
    await order.save();

    console.log("Refund Success:", refund.id);

    return NextResponse.json({ message: "Refund success", refund });
  } catch (error: any) {
    console.error("Refund Error:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: error?.error?.description || "Refund failed" },
      { status: 500 }
    );
  }
}
