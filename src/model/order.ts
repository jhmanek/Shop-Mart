import { Schema, model, models, Types } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        price: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    estimatedDelivery: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    paymentId: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      required: true,
    },
    refundId: {
      type: String,
      default: "",
      required: false,
    },
    orderStatus: {
      type: String,
      enum: [
        "place",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
        "payment_failed",
        "pending",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

export default models.Order || model("Order", orderSchema);
