"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
  Handshake,
  MapPinned,
  Navigation,
  DoorOpen,
  AlertOctagon,
  PackageX,
} from "lucide-react";

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
  {
    key: "shipped",
    label: "Shipped",
    icon: <Navigation className="w-4 h-4" />,
  },
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
    icon: <AlertOctagon className="w-4 h-4" />,
  },
  { key: "failed", label: "Cancelled", icon: <PackageX className="w-4 h-4" /> },
];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-300">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-white dark:bg-black text-black dark:text-white">
      <h1 className="text-3xl font-bold mb-10 text-center">My Orders</h1>
      <div className="space-y-8 max-w-4xl mx-auto">
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
              className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow p-6 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
                <p>
                  <span className="font-semibold">Order ID:</span> #
                  {order._id.slice(-6).toUpperCase()}
                </p>
                <p>
                  <span className="font-semibold">Placed:</span>{" "}
                  {format(new Date(order.createdAt), "dd MMM yyyy")}
                </p>
              </div>

              {/* Progress Tracker */}
              <div className="relative flex justify-between items-center mb-6">
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
                    if (index < activeStep) return "bg-green-500";
                    if (index === activeStep && step.key === "shipped")
                      return "bg-orange-400";
                    return "bg-gray-400";
                  };

                  return (
                    <div key={step.key} className="relative flex-1 text-center">
                      <div
                        className={`relative z-10 w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-white font-bold shadow-md transition-all duration-500 ${getCircleColor()}`}
                      >
                        {step.icon}
                      </div>
                      <p className={`text-xs ${getTextColor()}`}>
                        {step.label}
                      </p>

                      {/* Line connector */}
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

              {/* Products */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 dark:border-neutral-700">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 rounded border object-cover"
                    />
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-500">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
