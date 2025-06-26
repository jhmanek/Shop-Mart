import { Schema, models, model, Document } from "mongoose";

export interface ICartItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  mobile: string;
  password: string;
  address?: string;
  otp?: string;
  otpExpiry?: Date;
  role: "user" | "admin";
  cart?: ICartItem[];
}

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: String, required: true },
    title: { type: String },
    image: { type: String },
    price: { type: Number },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    mobile: { type: String, required: true, index: true },
    password: { type: String, required: true },
    address: { type: String, default: "" },
    otp: { type: String },
    otpExpiry: { type: Date },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    cart: [cartItemSchema],
  },
  { timestamps: true }
);

const User = models.User || model<IUser>("User", userSchema);

export default User;
