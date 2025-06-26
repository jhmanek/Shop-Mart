"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useRazorpay } from "@/app/Pages/buynow/page";
import { useDispatch } from "react-redux";
import { clearCart } from "@/app/cart/cartslice";

export default function AddAddressPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { openRazorpay } = useRazorpay();
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (!address.trim()) {
      alert("Address cannot be empty");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first.");
      router.push("/Pages/signup");
      return;
    }

    setLoading(true);

    try {
      await axios.patch(
        "/api/profile/address",
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const cartRes = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cartItems = cartRes.data.cart || [];
      const totalPrice = cartItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );

      if (totalPrice === 0) {
        alert("Cart is empty.");
        setLoading(false);
        return;
      }

      const orderRes = await axios.post(
        "/api/payment",
        { amount: totalPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { id: razorpay_order_id } = orderRes.data.order;

      openRazorpay(
        totalPrice,
        razorpay_order_id,
        async (response) => {
          const { razorpay_payment_id, razorpay_signature } = response;

          try {
            const verifyRes = await axios.post(
              "/api/payment/verify",
              {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              alert("Payment Successful!");

              await axios.post(
                "/api/admin/order",
                {
                  items: cartItems,
                  totalAmount: totalPrice,
                  paymentStatus: "paid",
                  address,
                  paymentId: razorpay_payment_id,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              await axios.delete("/api/cart", {
                headers: { Authorization: `Bearer ${token}` },
              });

              dispatch(clearCart());
              router.push("/");
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            alert("Something went wrong after payment.");
          } finally {
            setLoading(false);
          }
        },
        async () => {
          alert("Payment failed or cancelled.");

          try {
            await axios.post(
              "/api/admin/order",
              {
                items: cartItems,
                totalAmount: totalPrice,
                paymentStatus: "failed",
                address,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (err) {
            console.error("Order store failed:", err);
          } finally {
            setLoading(false);
          }
        }
      );
    } catch (err) {
      console.error("Error during address or payment init:", err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-50 via-fuchsia-100 to-pink-200 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 text-black dark:text-white shadow-xl rounded-3xl p-8 border border-pink-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-pink-700 dark:text-pink-400 mb-6 text-center">
          Add Your Delivery Address
        </h2>

        <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700 dark:text-white">
          <FaMapMarkerAlt className="text-pink-600 " />
          Full Address
        </label>

        <textarea
          className="w-full border border-pink-300 dark:border-pink-600 dark:placeholder:text-white text-gray-700 dark:text-white dark:bg-neutral-800 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none min-h-[120px]"
          rows={5}
          placeholder="House no, Street, Landmark, City, State, Pincode..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full bg-pink-600 hover:bg-pink-700 cursor-all-scroll dark:bg-pink-500 dark:hover:bg-pink-600 text-white font-semibold py-3 rounded-xl transition-shadow shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {loading ? "Processing..." : "Save & Pay Now"}
        </button>
      </div>
    </div>
  );
}
