import { NextResponse } from "next/server";
import { Product } from "@//model/products";
import connectDB from "@//lib/mongoose";

export async function GET() {
  await connectDB();
  const products = await Product.find();
  return NextResponse.json(products);
}
