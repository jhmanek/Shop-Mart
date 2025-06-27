import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User, { ICartItem } from "@/model/user";
import { authenticate } from "@/lib/authentication";
import { rateLimit } from "@/lib/rateLimiter";

// Utility to check rate limit
async function checkRateLimit(req: NextRequest) {
  const user = await authenticate(req);
  const key =
    user?._id?.toString() || req.headers.get("x-forwarded-for") || "unknown";

  const allowed = rateLimit(key, 5, 3000); // 5 requests per 3 seconds
  if (!allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }
  return user;
}

// GET: Fetch user's cart
export async function GET(req: NextRequest) {
  await connectDB();
  const user = await checkRateLimit(req);
  if (user instanceof NextResponse) return user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await User.findById(user._id).select("cart");
  return NextResponse.json({ cart: dbUser?.cart || [] });
}

// POST: Add item to cart
export async function POST(req: NextRequest) {
  await connectDB();
  const user = await checkRateLimit(req);
  if (user instanceof NextResponse) return user;

  const body = await req.json();
  const { productId, title, image, price, quantity } = body;

  if (
    !productId ||
    typeof productId !== "string" ||
    typeof title !== "string" ||
    typeof image !== "string" ||
    typeof price !== "number" ||
    typeof quantity !== "number" ||
    isNaN(quantity) ||
    quantity < 1
  ) {
    return NextResponse.json(
      { error: "Invalid product data" },
      { status: 400 }
    );
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dbUser = await User.findById(user._id);
  if (!dbUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (!dbUser.cart) dbUser.cart = [];

  const itemIndex = dbUser.cart.findIndex(
    (item: { productId: string }) => item.productId === productId
  );

  if (itemIndex !== -1) {
    dbUser.cart[itemIndex].quantity += quantity;
  } else {
    dbUser.cart.push({ productId, title, image, price, quantity });
  }

  await dbUser.save();
  return NextResponse.json({ cart: dbUser.cart });
}

// PATCH: Update quantity / remove single item
export async function PATCH(req: NextRequest) {
  await connectDB();
  const user = await checkRateLimit(req);
  if (user instanceof NextResponse) return user;

  const { productId, action } = await req.json();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await User.findById(user._id);
  if (!dbUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (!dbUser.cart) dbUser.cart = [];

  const itemIndex = dbUser.cart.findIndex(
    (item: ICartItem) => item.productId === productId
  );

  if (itemIndex === -1) {
    return NextResponse.json({ error: "Product not in cart" }, { status: 404 });
  }

  if (action === "increase") {
    dbUser.cart[itemIndex].quantity += 1;
  } else if (action === "decrease") {
    if (dbUser.cart[itemIndex].quantity > 1) {
      dbUser.cart[itemIndex].quantity -= 1;
    } else {
      dbUser.cart.splice(itemIndex, 1);
    }
  } else if (action === "remove") {
    dbUser.cart.splice(itemIndex, 1);
  }

  await dbUser.save();
  return NextResponse.json({ cart: dbUser.cart });
}

// DELETE: Clear entire cart
export async function DELETE(req: NextRequest) {
  await connectDB();
  const user = await checkRateLimit(req);
  if (user instanceof NextResponse) return user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await User.findById(user._id);
  if (!dbUser)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  dbUser.cart = [];
  await dbUser.save();

  return NextResponse.json({ message: "Cart cleared", cart: [] });
}
