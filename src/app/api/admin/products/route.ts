import { NextRequest, NextResponse } from "next/server";
import { Product } from "@//model/products";
import connectDB from "@/lib/mongoose";
import { isAdmin } from "@/lib/authentication";
import mongoose from "mongoose";

// GET: Fetch all products
export async function GET(req: NextRequest) {
  await connectDB();

  const user = await isAdmin(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await Product.find();

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST: Create new product
export async function POST(req: NextRequest) {
  await connectDB();

  const user = await isAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.title || !data.price) {
      return NextResponse.json(
        { error: "Title and price are required" },
        { status: 400 }
      );
    }

    const product = await Product.create(data);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a product by ID (via query param)
// export async function DELETE(req: NextRequest) {
//   await connectDB();

//   const user = await isAdmin(req);
//   if (!user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id");

//   if (!id) {
//     return NextResponse.json({ error: "Product ID required" }, { status: 400 });
//   }

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return NextResponse.json({ error: "Invalid Product ID" }, { status: 400 });
//   }

//   try {
//     const deleted = await Product.findByIdAndDelete(id);
//     if (!deleted) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }
//     return NextResponse.json({ message: "Product deleted successfully" });
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message || "Failed to delete product" },
//       { status: 500 }
//     );
//   }
// }
export async function DELETE(req: NextRequest) {
  await connectDB();

  const user = await isAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let id: string;
  try {
    const body = await req.json();
    id = body.id;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid Product ID" }, { status: 400 });
  }

  try {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
// PATCH: Partially update a product
export async function PATCH(req: NextRequest) {
  await connectDB();

  const user = await isAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid Product ID" },
        { status: 400 }
      );
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// PUT: Fully replace/update a product
export async function PUT(req: NextRequest) {
  await connectDB();

  const user = await isAdmin(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { id, title, price, description, image, category } = data;

    if (!id || !title || !price || !image || !category) {
      return NextResponse.json(
        {
          error: "Product id, title, price, image, and category are required",
        },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid Product ID" },
        { status: 400 }
      );
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      { title, price, description, image, category },
      { new: true, runValidators: true, overwrite: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}
