import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User, { ICartItem } from "@/model/user";
import { authenticate } from "@/lib/authentication";

// GET: Fetch user's cart
export async function GET(req: NextRequest) {
  await connectDB();
  const user = await authenticate(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await User.findById(user._id).select("cart");
  return NextResponse.json({ cart: dbUser?.cart || [] });
}

// POST: Add item to cart
export async function POST(req: NextRequest) {
  await connectDB();
  const user = await authenticate(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const dbUser = await User.findById(user._id);
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

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
  const user = await authenticate(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, action } = await req.json();

  const dbUser = await User.findById(user._id);
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

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

// ✅ DELETE: Clear entire cart
export async function DELETE(req: NextRequest) {
  await connectDB();
  const user = await authenticate(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await User.findById(user._id);
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  dbUser.cart = []; // clear the cart array
  await dbUser.save();

  return NextResponse.json({ message: "Cart cleared", cart: [] });
}
