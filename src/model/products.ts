import { Schema, model, models } from "mongoose";

const productSchema = new Schema(
  {
    title: String,
    description: String,
    price: Number,
    category: String,
    image: String,
  },
  { timestamps: true }
);

export const Product = models.Product || model("Product", productSchema);

// prduct show in home page..
