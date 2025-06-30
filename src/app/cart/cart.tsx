"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  setCart,
} from "@/app/cart/cartslice";
import { RootState } from "@/store/store";
import {
  TrashIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRazorpay } from "@/app/Pages/buynow/page";
import { useRouter } from "next/navigation";
import axios from "axios";

type CartProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Cart({ isOpen, onClose }: CartProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const { openRazorpay } = useRazorpay();

  const handleQuantityChange = async (
    productId: string,
    action: "increase" | "decrease"
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Pages/signup");
      return;
    }

    try {
      const res = await axios.patch(
        "/api/cart",
        { productId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch(setCart(res.data.cart));
    } catch (error: any) {
      console.error(
        "Error updating cart:",
        error.response?.data || error.message
      );
    }
  };

  const handleClearCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Pages/signup");
      return;
    }

    try {
      await axios.delete("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch(clearCart());
    } catch (error: any) {
      console.error(
        "Failed to clear cart:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!isOpen || !token) return;

    const fetchUserCart = async () => {
      try {
        const res = await axios.get("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(setCart(res.data.cart || []));
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };

    fetchUserCart();
  }, [isOpen, dispatch]);

  const handleBuyNow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Pages/signup");
      onClose();
      return;
    }

    try {
      const res = await axios.get("/api/profile/address", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userAddress = res.data?.address;

      if (!userAddress || userAddress.trim() === "") {
        onClose();
        router.push("/Pages/profile/address");
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
                  address: userAddress,
                  paymentId: razorpay_payment_id,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              await axios.delete("/api/cart", {
                headers: { Authorization: `Bearer ${token}` },
              });

              dispatch(clearCart());
              onClose();
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error("Payment verification/store error:", err);
            alert("Something went wrong after payment.");
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
                address: userAddress,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (err) {
            console.error("Failed order store error:", err);
          }
        }
      );
    } catch (error) {
      console.error("Address or order error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-transform duration-300 ease-in-out bg-white dark:bg-black text-black dark:text-white ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="max-w-5xl mx-auto mt-10 mb-20 px-4 sm:px-10">
        <div className="flex justify-between items-center border-b border-b-gray-200 dark:border-zinc-700 pb-4 mb-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FF3F6C]">
            My Cart
          </h2>
          <button onClick={onClose} aria-label="Close Cart">
            <XMarkIcon className="h-8 w-8 text-gray-600 dark:text-gray-300 hover:text-[#FF3F6C] cursor-pointer" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            <ShoppingBagIcon className="h-20 w-20 mx-auto mb-6" />
            <p className="text-xl font-semibold mb-4">Your cart is empty!</p>
            <button
              onClick={() => {
                router.push("/");
                onClose();
              }}
              className="bg-[#FF3F6C] hover:bg-[#e33661] text-white px-8 py-3 rounded-full font-semibold cursor-pointer"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col sm:flex-row items-center border border-white dark:border-zinc-700 p-4 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <Image
                    src={item.image.trim()}
                    alt={item.title}
                    width={100}
                    height={100}
                    className="rounded-lg object-contain"
                  />
                  <div className="flex flex-col flex-grow sm:ml-6 w-full">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-[#FF3F6C] font-bold mt-1 text-base sm:text-lg">
                      ₹{item.price.toFixed(2)}
                    </p>

                    <div className="flex items-center mt-3 space-x-4">
                      <button
                        onClick={() => {
                          if (item.quantity > 0) {
                            dispatch(decreaseQuantity(item.productId));
                            handleQuantityChange(item.productId, "decrease");
                          }
                        }}
                        className="px-3 py-1 rounded-full border border-[#FF3F6C] text-[#FF3F6C] hover:bg-[#FF3F6C] hover:text-white font-semibold transition cursor-pointer"
                      >
                        −
                      </button>
                      <span className="text-lg font-bold">{item.quantity}</span>
                      <button
                        onClick={() => {
                          dispatch(increaseQuantity(item.productId));
                          handleQuantityChange(item.productId, "increase");
                        }}
                        className="px-3 py-1 rounded-full border border-[#FF3F6C] text-[#FF3F6C] hover:bg-[#FF3F6C] hover:text-white font-semibold transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-lg font-bold mt-4 sm:mt-0 sm:ml-auto">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="text-2xl font-bold">
                Total:{" "}
                <span className="text-[#FF3F6C]">₹{totalPrice.toFixed(2)}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleBuyNow}
                  className="bg-[#FF3F6C] hover:bg-[#e33661] text-white px-10 py-3 rounded-full font-bold text-lg transition cursor-pointer"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => {
                    if (confirm("Clear entire cart?")) {
                      handleClearCart();
                    }
                  }}
                  className="flex items-center justify-center gap-2 border border-gray-300 dark:border-zinc-600 px-6 py-3 rounded-full text-gray-600 dark:text-gray-300 hover:text-[#FF3F6C] hover:border-[#FF3F6C] transition cursor-pointer"
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
