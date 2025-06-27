// import { NextRequest, NextResponse } from "next/server";
// import connectDB from "@/lib/mongoose";
// import Order from "@/model/order";
// import { Product } from "@/model/products"; // ✅ Add this
// import { authenticate } from "@/lib/authentication";

// export async function POST(req: NextRequest) {
//   try {
//     await connectDB();

//     const user = await authenticate(req);
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { items, totalAmount, address, paymentStatus, paymentId } =
//       await req.json();

//     // ✅ Input validation
//     if (
//       !items ||
//       !Array.isArray(items) ||
//       items.length === 0 ||
//       !totalAmount ||
//       !address ||
//       (paymentStatus === "paid" && !paymentId)
//     ) {
//       return NextResponse.json(
//         { error: "Invalid order data" },
//         { status: 400 }
//       );
//     }

//     // ✅ Enrich cart items from DB
//     const enrichedItems = await Promise.all(
//       items.map(async (item: any) => {
//         try {
//           const product = await Product.findById(item.productId);
//           if (!product) {
//             console.warn("Missing product:", item.productId);
//             return null;
//           }

//           return {
//             productId: product._id,
//             title: product.title,
//             image: product.image,
//             price: product.price,
//             quantity: item.quantity,
//           };
//         } catch (err) {
//           console.error("Error fetching product:", item.productId, err);
//           return null;
//         }
//       })
//     );

//     const filteredItems = enrichedItems.filter(Boolean); // remove nulls

//     if (filteredItems.length === 0) {
//       return NextResponse.json(
//         { error: "No valid items to place order." },
//         { status: 400 }
//       );
//     }

//     // ✅ Create Order with correct orderStatus
//     const newOrder = await Order.create({
//       user: user._id,
//       items: filteredItems,
//       totalAmount,
//       address,
//       paymentId,
//       paymentStatus: paymentStatus || "paid",
//       orderStatus:
//         paymentStatus === "failed"
//           ? "payment_failed"
//           : paymentStatus === "paid"
//           ? "confirmed"
//           : "pending",
//     });

//     return NextResponse.json({ success: true, order: newOrder });
//   } catch (error: any) {
//     console.error("Order POST error:", error.message || error);
//     return NextResponse.json(
//       { error: error.message || "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// // export async function GET(req: NextRequest) {
// //   try {
// //     await connectDB();

// //     const user = await authenticate(req);
// //     if (!user) {
// //       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// //     }

// //     const orders = await Order.find({ user: user._id })
// //       .sort({ createdAt: -1 })
// //       .populate("user", "name email avatar");

// //     return NextResponse.json({ orders });
// //   } catch (error) {
// //     console.error("Order GET error:", error);
// //     return NextResponse.json(
// //       { error: "Internal server error" },
// //       { status: 500 }
// //     );
// //   }
// // }
// // export async function GET(req: NextRequest) {
// //   try {
// //     await connectDB();

// //     const user = await authenticate(req);
// //     if (!user) {
// //       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// //     }

// //     const { searchParams } = new URL(req.url);
// //     const status = searchParams.get("status");
// //     const payment = searchParams.get("payment");

// //     const query: any = {};

// //     if (status === "cancelled") {
// //       query.paymentStatus = "failed"; // 👈 smart mapping
// //     } else if (status) {
// //       query.orderStatus = status;
// //     }

// //     if (payment) {
// //       query.paymentStatus = payment;
// //     }

// //     const orders = await Order.find(query)
// //       .sort({ createdAt: -1 })
// //       .populate("user", "name email");

// //     return NextResponse.json({ orders });
// //   } catch (error) {
// //     console.error("Admin Order GET Error:", error);
// //     return NextResponse.json(
// //       { error: "Failed to fetch orders" },
// //       { status: 500 }
// //     );
// //   }
// // }
// export async function GET(req: NextRequest) {
//   try {
//     await connectDB();

//     const user = await authenticate(req);
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const searchParams = req.nextUrl.searchParams;
//     const status = searchParams.get("status");
//     const payment = searchParams.get("payment");

//     const query: any = {};

//     if (status) {
//       query.orderStatus = status.toLowerCase(); // e.g. "delivered"
//     }

//     if (payment) {
//       query.paymentStatus = payment.toLowerCase(); // e.g. "paid"
//     }

//     const orders = await Order.find(query)
//       .sort({ createdAt: -1 })
//       .populate("user", "name email");

//     return NextResponse.json({ orders });
//   } catch (error) {
//     console.error("Admin Order GET Error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch orders" },
//       { status: 500 }
//     );
//   }
// }

// export async function PATCH(req: NextRequest) {
//   try {
//     await connectDB();
//     const user = await authenticate(req);
//     if (!user || user.role !== "admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { orderId, orderStatus, paymentStatus } = await req.json();

//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       { orderStatus, paymentStatus },
//       { new: true }
//     );

//     return NextResponse.json({ success: true, order: updatedOrder });
//   } catch (error) {
//     console.error("Order PATCH error:", error);
//     return NextResponse.json(
//       { error: "Failed to update order" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(req: NextRequest) {
//   try {
//     await connectDB();
//     const user = await authenticate(req);
//     if (!user || user.role !== "admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { orderId } = await req.json();

//     await Order.findByIdAndDelete(orderId);
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Order DELETE error:", error);
//     return NextResponse.json(
//       { error: "Failed to delete order" },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Order from "@/model/order";
import { Product } from "@/model/products";
import { authenticate, isAdmin } from "@/lib/authentication";
import { rateLimit } from "@/lib/rateLimiter"; // ✅ Rate limiter

// 📦 POST: Create new order (user level, not admin)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const allowed = rateLimit(ip, 5, 3000); // Regular user limit
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, totalAmount, address, paymentStatus, paymentId } =
      await req.json();

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !totalAmount ||
      !address ||
      (paymentStatus === "paid" && !paymentId)
    ) {
      return NextResponse.json(
        { error: "Invalid order data" },
        { status: 400 }
      );
    }

    const enrichedItems = await Promise.all(
      items.map(async (item: any) => {
        try {
          const product = await Product.findById(item.productId);
          if (!product) return null;
          return {
            productId: product._id,
            title: product.title,
            image: product.image,
            price: product.price,
            quantity: item.quantity,
          };
        } catch {
          return null;
        }
      })
    );

    const filteredItems = enrichedItems.filter(Boolean);
    if (filteredItems.length === 0) {
      return NextResponse.json(
        { error: "No valid items to place order." },
        { status: 400 }
      );
    }

    const newOrder = await Order.create({
      user: user._id,
      items: filteredItems,
      totalAmount,
      address,
      paymentId,
      paymentStatus: paymentStatus || "paid",
      orderStatus:
        paymentStatus === "failed"
          ? "payment_failed"
          : paymentStatus === "paid"
          ? "confirmed"
          : "pending",
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error("Order POST error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// 🧾 GET: Admin fetch orders
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const allowed = rateLimit(ip, 10, 3000); // Admin GET limit
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await isAdmin(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const payment = searchParams.get("payment");

    const query: any = {};
    if (status) query.orderStatus = status.toLowerCase();
    if (payment) query.paymentStatus = payment.toLowerCase();

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    const now = new Date();
    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        if (order.paymentStatus !== "paid") return order;

        const createdAt = new Date(order.createdAt);
        const hoursPassed =
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        let newStatus = order.orderStatus;
        if (hoursPassed < 1) newStatus = "confirmed";
        else if (hoursPassed < 24) newStatus = "place";
        else if (hoursPassed < 48) newStatus = "shipped";
        else newStatus = "delivered";

        if (newStatus !== order.orderStatus) {
          order.orderStatus = newStatus;
          await order.save();
        }

        return order;
      })
    );

    return NextResponse.json({ orders: updatedOrders });
  } catch (error) {
    console.error("Admin Order GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// 🛠️ PATCH: Admin update order status/payment
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const allowed = rateLimit(ip, 10, 3000); // Admin update limit
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await isAdmin(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, orderStatus, paymentStatus } = await req.json();

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus, paymentStatus },
      { new: true }
    );

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Order PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// ❌ DELETE: Admin delete order
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const allowed = rateLimit(ip, 5, 3000); // Delete limit tighter
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many delete attempts" },
        { status: 429 }
      );
    }

    const user = await isAdmin(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    await Order.findByIdAndDelete(orderId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
