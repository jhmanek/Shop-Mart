"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
  Handshake,
  MapPinned,
  Truck,
  DoorOpen,
  BanknoteX,
  PackageX,
} from "lucide-react";
import Link from "next/link";

const STATUS_STEPS = [
  {
    key: "confirmed",
    label: "Confirmed",
    icon: <Handshake className="w-4 h-4" />,
  },
  {
    key: "place",
    label: "Order Placed",
    icon: <MapPinned className="w-4 h-4" />,
  },
  { key: "shipped", label: "Shipped", icon: <Truck className="w-4 h-4" /> },
  {
    key: "delivered",
    label: "Delivered",
    icon: <DoorOpen className="w-4 h-4" />,
  },
];

const FAILED_STEPS = [
  {
    key: "payment-failed",
    label: "Payment Failed",
    icon: <BanknoteX className="w-4 h-4" />,
  },
  { key: "failed", label: "Cancelled", icon: <PackageX className="w-4 h-4" /> },
];

type OrderItem = {
  image: string;
  title: string;
  price: number;
  quantity: number;
};

type Order = {
  _id: string;
  createdAt: string;
  orderStatus: string;
  address: string;
  totalAmount: number;
  estimatedDelivery?: string;
  items: OrderItem[];
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({
    open: false,
    orderId: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("/api/user/order", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const getStepIndex = (status: string) =>
    STATUS_STEPS.findIndex((s) => s.key === status);

  const handleCancelOrder = async () => {
    const token = localStorage.getItem("token");
    if (!cancelModal.orderId || !token) return;
    try {
      await axios.patch(
        `/api/order/${cancelModal.orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders((prev) =>
        prev.map((order) =>
          order._id === cancelModal.orderId
            ? { ...order, orderStatus: "failed" }
            : order
        )
      );
      setCancelModal({ open: false, orderId: null });
    } catch (err) {
      console.error("Cancel Failed", err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black">
        <img
          src="/favicon.png"
          alt="Loading"
          className="w-24 h-24 md:w-32 md:h-32 object-contain animate-bounce"
        />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-black rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center border dark:border-gray-700 mx-auto my-24">
        <img
          src="https://cdn-icons-png.flaticon.com/512/825/825561.png"
          alt="No Orders"
          className="w-24 h-24 mx-auto mb-6 dark:invert opacity-90"
        />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          No Orders Yet
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          It looks like you haven’t placed any orders yet. Once you do, they’ll
          show up here.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 rounded-full bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium shadow-lg"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-white dark:bg-black text-black dark:text-white">
      <div className="flex flex-col items-center mb-10 hover:scale-95 ease-in-out p-8 rounded-xl   transform hover:translate-y-2  transition-all duration-500">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-800 dark:text-white transform hover:scale-95 hover:text-yellow-400 transition-all duration-500 ease-in-out text-shadow-lg ">
          My Orders
        </h1>
        <span className="uppercase text-xs tracking-widest text-gray-500 dark:text-gray-500 mb-2 transform hover:translate-x-3 hover:text-green-700 transition-all duration-500 ease-in-out animate-pulse">
          Your Store Activity
        </span>
      </div>
      {cancelModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl max-w-md w-full shadow-xl">
            <h2 className="text-lg font-bold mb-2 text-red-600 dark:text-red-400">
              Cancel Order?
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Your order will be cancelled and a refund will be processed within
              2–3 working days to your bank account.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setCancelModal({ open: false, orderId: null })}
                className="px-4 py-2 text-sm rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
              >
                Exit
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8 max-w-5xl mx-auto">
        {orders.map((order: any) => {
          const isFailed =
            order.orderStatus === "failed" ||
            order.orderStatus === "payment_failed";

          const stepsToRender = isFailed ? FAILED_STEPS : STATUS_STEPS;
          const activeStep = isFailed
            ? FAILED_STEPS.length - 1
            : getStepIndex(order.orderStatus);

          return (
            <div
              key={order._id}
              className="bg-white dark:bg-neutral-950 border border-gray-300 dark:border-neutral-800 
              rounded-lg p-4 sm:p-6 transition-transform duration-300 
              hover:scale-[1.01] hover:border-primary/70"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between mb-4 text-sm text-gray-500 dark:text-gray-400 gap-1">
                <p>
                  <span className="font-semibold">Order ID:</span> #
                  {order._id.slice(-6).toUpperCase()}
                </p>
                <p>
                  <span className="font-semibold">Placed:</span>{" "}
                  {format(new Date(order.createdAt), "dd MMM yyyy")}
                </p>
              </div>

              {/* Status Progress Tracker */}
              <div className="relative flex justify-between items-center mb-6 overflow-x-auto sm:overflow-visible">
                {stepsToRender.map((step, index) => {
                  const isActive = index <= activeStep;

                  const getCircleColor = () => {
                    if (isFailed) return "bg-red-600";
                    if (index === activeStep && step.key === "shipped")
                      return "bg-orange-500";
                    return isActive ? "bg-green-600" : "bg-gray-400";
                  };

                  const getTextColor = () => {
                    if (isFailed) return "text-red-500";
                    if (index === activeStep && step.key === "shipped")
                      return "text-orange-500";
                    return isActive
                      ? "text-green-700 dark:text-green-400"
                      : "text-gray-400";
                  };

                  const getLineColor = () => {
                    if (isFailed) return "bg-red-500";

                    const placedIndex = getStepIndex("place");
                    const shippedIndex = getStepIndex("shipped");

                    if (index === placedIndex && activeStep >= shippedIndex) {
                      return "bg-orange-400";
                    }

                    return index < activeStep ? "bg-green-500" : "bg-gray-400";
                  };

                  return (
                    <div
                      key={step.key}
                      className="relative flex-1 text-center min-w-[60px]"
                    >
                      <div
                        className={`relative z-10 w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-white font-bold shadow-md ${getCircleColor()}`}
                      >
                        {step.icon}
                      </div>
                      <p className={`text-[10px] sm:text-sm ${getTextColor()}`}>
                        {step.label}
                      </p>

                      {/* Line */}
                      {index < stepsToRender.length - 1 && (
                        <div className="absolute top-4 left-1/2 w-full h-1 transform -translate-y-1/2 z-0">
                          <div
                            className={`${getLineColor()} h-1`}
                            style={{ width: "100%" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Product Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 dark:border-neutral-700">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex gap-4 items-center">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 rounded border object-cover"
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-base">{item.title}</p>
                      <p className="text-gray-500">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <p>
                  <span className="font-semibold">Total:</span> ₹
                  {order.totalAmount.toFixed(2)}
                </p>
                <p>
                  <span className="font-semibold">Address:</span>{" "}
                  {order.address}
                </p>
                <p>
                  <span className="font-semibold">Est. Delivery:</span>{" "}
                  {order.estimatedDelivery
                    ? format(new Date(order.estimatedDelivery), "dd MMM yyyy")
                    : "Not available"}
                </p>
                {order.orderStatus !== "delivered" &&
                  order.orderStatus !== "failed" && (
                    <div className="pt-4">
                      <button
                        onClick={() =>
                          setCancelModal({ open: true, orderId: order._id })
                        }
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow text-sm"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
