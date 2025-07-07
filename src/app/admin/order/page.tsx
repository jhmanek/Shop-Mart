// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   ColumnDef,
//   useReactTable,
//   getCoreRowModel,
//   flexRender,
// } from "@tanstack/react-table";
// import { notFound } from "next/navigation";
// import { Order } from "../types/order";
// import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

// export default function AdminOrdersTable() {
//   const [data, setData] = useState<Order[]>([]);
//   const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
//   const [loading, setLoading] = useState(true);
//   console.log("data :", data);

//   const fetchOrders = async () => {
//     try {
//       const res = await axios.get("/api/admin/order", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });

//       if (res.status === 200) {
//         console.log("res", res);
//         setIsAdmin(true);
//         const updatedOrders = res.data.orders.map((order: Order) => {
//           const created = new Date(order.createdAt);
//           const now = new Date();
//           const diffDays = Math.floor(
//             (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
//           );

//           let orderStatus = order.orderStatus;

//           // If payment failed, show "-"
//           if (order.paymentStatus === "failed") {
//             orderStatus = "cancelled";
//           } else {
//             // Update orderStatus only if not failed
//             if (diffDays >= 3) {
//               orderStatus = "delivered";
//             } else if (diffDays >= 1) {
//               orderStatus = "shipped";
//             } else {
//               orderStatus = "placed";
//             }
//           }

//           return { ...order, orderStatus };
//         });

//         setData(updatedOrders);
//       }
//     } catch (err) {
//       console.error("Error fetching orders", err);
//       setIsAdmin(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const handleDelete = async (orderId: string) => {
//     if (!confirm("Are you sure you want to delete this order?")) return;
//     try {
//       await axios.delete("/api/admin/order", {
//         data: { orderId },
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       fetchOrders();
//     } catch (error) {
//       console.error("Delete failed", error);
//     }
//   };

//   const handleEdit = async (orderId: string) => {
//     const newStatus = prompt(
//       "Enter new order status (placed/shipped/delivered):"
//     );
//     const newPayment = prompt("Enter new payment status (paid/pending):");
//     if (!newStatus || !newPayment) return;

//     try {
//       await axios.patch(
//         "/api/admin/order",
//         { orderId, orderStatus: newStatus, paymentStatus: newPayment },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       fetchOrders();
//     } catch (error) {
//       console.error("Update failed", error);
//     }
//   };

//   if (isAdmin === false) {
//     notFound();
//     return null;
//   }

//   const columns: ColumnDef<Order>[] = [
//     {
//       header: "Customer Name",
//       accessorFn: (row) =>
//         typeof row.user === "string" ? row.user : row.user.name,
//     },
//     {
//       header: "Items",
//       accessorKey: "items",
//       cell: ({ row }) => (
//         <div className="flex flex-wrap gap-3">
//           {row.original.items.map((item, idx) => (
//             <div
//               key={idx}
//               className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg p-2 shadow-sm max-w-xs"
//             >
//               <img
//                 src={item.image || "/fallbackimage.png"}
//                 alt={item.title || "Product"}
//                 className="w-12 h-12 object-cover rounded-md"
//               />
//               <span
//                 className="text-sm text-gray-200 max-w-[200px] truncate block"
//                 title={item.title}
//               >
//                 {item.title}
//               </span>
//             </div>
//           ))}
//         </div>
//       ),
//     },
//     {
//       header: "Total Items",
//       accessorFn: (row) =>
//         row.items.reduce((total, item) => total + item.quantity, 0),
//       cell: (info) => {
//         const totalItems = info.getValue() as number;
//         return (
//           <span className="text-sm font-medium text-white">
//             {totalItems} items
//           </span>
//         );
//       },
//     },

//     {
//       header: "Total Amount",
//       accessorKey: "totalAmount",
//       cell: (info) => (
//         <span className="text-[#FF3F6C] font-semibold">
//           ₹{Number(info.getValue()).toFixed(2)}
//         </span>
//       ),
//     },

//     {
//       header: "Payment Status",
//       accessorKey: "paymentStatus",
//       cell: (info) => {
//         const value = info.getValue() as "pending" | "paid";
//         return (
//           <span
//             className={`text-xs font-bold px-3 py-1 rounded-full tracking-wide ${
//               value === "paid"
//                 ? "bg-green-600/20 text-green-400"
//                 : "bg-yellow-600/20 text-yellow-300"
//             }`}
//           >
//             {value.toUpperCase()}
//           </span>
//         );
//       },
//     },
//     {
//       header: "Order Status",
//       accessorKey: "orderStatus",
//       cell: (info) => {
//         const value = info.getValue() as "placed" | "shipped" | "delivered";
//         return (
//           <span
//             className={`text-xs font-bold px-3 py-1 rounded-full tracking-wide ${
//               value === "shipped"
//                 ? "bg-blue-600/20 text-blue-400"
//                 : value === "delivered"
//                 ? "bg-green-600/20 text-green-400"
//                 : "bg-gray-600/20 text-gray-300"
//             }`}
//           >
//             {value.toUpperCase()}
//           </span>
//         );
//       },
//     },
//     {
//       header: "Actions",
//       cell: ({ row }) => (
//         <div className="flex gap-3">
//           <PencilIcon
//             className="h-5 w-5 text-blue-400 hover:text-blue-600 cursor-pointer"
//             onClick={() => handleEdit(row.original._id)}
//           />
//           <TrashIcon
//             className="h-5 w-5 text-red-400 hover:text-red-600 cursor-pointer"
//             onClick={() => handleDelete(row.original._id)}
//           />
//         </div>
//       ),
//     },
//   ];

//   const table = useReactTable({
//     data,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//   });

//   if (loading) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f4eded]">
//         <img
//           src="/favicon.png"
//           alt="Loading"
//           className="w-24 h-24 animate-bounce"
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 min-h-screen bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] text-white">
//       <h2 className="text-3xl font-bold text-[#FF3F6C] mb-8 border-b border-[#333] pb-3">
//         Admin Order History
//       </h2>

//       <div className="overflow-x-auto rounded-xl border border-[#2c2c2c] bg-[#1e1e1e] shadow-lg">
//         <table className="min-w-full table-auto text-sm">
//           <thead className="bg-[#272727] text-gray-400 uppercase text-xs">
//             {table.getHeaderGroups().map((headerGroup) => (
//               <tr key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => (
//                   <th key={header.id} className="px-5 py-4 text-left">
//                     {flexRender(
//                       header.column.columnDef.header,
//                       header.getContext()
//                     )}
//                   </th>
//                 ))}
//               </tr>
//             ))}
//           </thead>
//           <tbody className="divide-y divide-[#333]">
//             {table.getRowModel().rows.map((row) => (
//               <tr
//                 key={row.id}
//                 className="hover:bg-[#292929] transition-colors duration-200"
//               >
//                 {row.getVisibleCells().map((cell) => (
//                   <td key={cell.id} className="px-5 py-4 align-top">
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Order } from "../types/order";
import {
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { notFound, useRouter } from "next/navigation";

export default function AdminOrdersTable() {
  const [data, setData] = useState<Order[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPayment, setEditPayment] = useState("");
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAdmin(false);
        return;
      }

      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (decoded.role !== "admin") {
        setIsAdmin(false);
        return;
      }

      const queries = [];
      if (statusFilter) queries.push(`status=${statusFilter}`);
      if (paymentFilter) queries.push(`payment=${paymentFilter}`);
      const queryString = queries.length ? `?${queries.join("&")}` : "";

      const res = await axios.get(`/api/admin/order${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        setIsAdmin(true);
        setData(res.data.orders);
      }
    } catch (err: any) {
      console.error("Error fetching orders", err);
      if (err.response?.status === 401) {
        setIsAdmin(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await axios.delete("/api/admin/order", {
        data: { orderId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchOrders();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.orderStatus);
    setEditPayment(order.paymentStatus);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder) return;

    try {
      await axios.patch(
        "/api/admin/order",
        {
          orderId: selectedOrder._id,
          orderStatus: editStatus,
          paymentStatus: editPayment,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setEditModalOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  useEffect(() => {
    document.body.style.overflow = editModalOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [editModalOpen]);

  useEffect(() => {
    if (isAdmin === false) {
      const timeout = setTimeout(() => {
        router.push("/admin/products");
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isAdmin]);

  if (isAdmin === false) return notFound();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black">
        <img
          src="/favicon.png"
          alt="Loading"
          className="w-24 h-24 animate-bounce"
        />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#f8f4f9] to-[#fdfcfe] dark:from-black dark:to-gray-950 text-[#333] dark:text-gray-100">
      <h2 className="text-3xl font-bold text-[#c2185b] dark:text-pink-700 mb-8">
        Admin Order History
      </h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 rounded-xl bg-white dark:bg-black shadow-md border border-gray-200 dark:border-[rgba(255,255,255,0.5)]">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-xl border border-gray-300 dark:border-[rgba(255,255,255,0.5)] bg-white dark:bg-black px-4 py-2 pr-8 text-sm text-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition cursor-pointer"
            >
              <option value=""> All Orders</option>
              <option value="confirmed">confirmed</option>
              <option value="place"> Place</option>
              <option value="shipped"> Shipped</option>
              <option value="delivered"> Delivered</option>
              <option value="cancelled"> Cancelled</option>
              <option value="payment_failed"> Payment Failed</option>
            </select>
          </div>

          <div className="w-full sm:w-48">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="block w-full rounded-xl border border-gray-300 dark:border-[rgba(255,255,255,0.5)] bg-white dark:bg-black px-4 py-2 pr-8 text-sm text-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition cursor-pointer"
            >
              <option value=""> All Payments</option>
              <option value="paid"> Paid</option>
              <option value="pending"> Pending</option>
              <option value="failed"> Failed</option>
              <option value="refunded">Refund</option>
            </select>
          </div>
        </div>

        {(statusFilter || paymentFilter) && (
          <div className="flex sm:justify-end">
            <button
              onClick={() => {
                setStatusFilter("");
                setPaymentFilter("");
              }}
              className="flex items-center justify-center rounded-lg border border-rose-100 bg-rose-50 dark:bg-rose-900 dark:border-rose-800 p-2 text-rose-600 dark:text-rose-300 hover:bg-rose-100 hover:text-rose-700 transition cursor-pointer"
              title="Clear Filters"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="space-y-6">
        <div className="hidden md:grid grid-cols-4 gap-4 px-6 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
          <span>Details</span>
          <span>Payment Status</span>
          <span>Order Status</span>
          <span className="text-center">Action</span>
        </div>

        {data.map((order) => {
          const isExpanded = expandedRows.includes(order._id);
          return (
            <div
              key={order._id}
              className={`bg-white dark:bg-black border rounded-2xl shadow-sm transition hover:shadow-md ${
                order.paymentStatus === "failed"
                  ? "border-red-400 dark:border-red-500"
                  : order.paymentStatus === "paid"
                  ? "border-green-400 dark:border-green-500"
                  : order.paymentStatus === "pending"
                  ? "border-yellow-400 dark:border-yellow-500"
                  : order.paymentStatus === "refunded"
                  ? "	border-gray-400 dark:border-gray-500"
                  : "border-[#eee] dark:border-gray-700"
              }`}
            >
              <div className="grid md:grid-cols-4 gap-4 items-center px-6 py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    Customer:{" "}
                    {typeof order.user === "string"
                      ? order.user
                      : order.user.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Date: {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Total: ₹{order.totalAmount.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Items:{" "}
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>

                <div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                        : order.paymentStatus === "pending"
                        ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                        : order.paymentStatus === "failed"
                        ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>

                <div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      order.orderStatus === "place"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                        : order.orderStatus === "shipped"
                        ? "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                        : order.orderStatus === "delivered"
                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                        : order.orderStatus === "cancelled"
                        ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                        : order.orderStatus === "confirmed"
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300"
                        : order.orderStatus === "payment_failed"
                        ? "bg-rose-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {order.orderStatus.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-center gap-4">
                  <PencilIcon
                    title="Edit Order"
                    className="h-5 w-5 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer transition-colors duration-200"
                    onClick={() => handleEdit(order)}
                  />
                  <TrashIcon
                    title="Delete Order"
                    className="h-5 w-5 text-red-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer transition-colors duration-200"
                    onClick={() => handleDelete(order._id)}
                  />
                  <ChevronDownIcon
                    onClick={() =>
                      setExpandedRows((prev) =>
                        isExpanded
                          ? prev.filter((id) => id !== order._id)
                          : [...prev, order._id]
                      )
                    }
                    title="View Items"
                    className={`h-5 w-5 cursor-pointer transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {isExpanded && (
                <div className="bg-pink-50 dark:bg-black rounded-2xl px-6 py-4 border-t border-pink-100 dark:border-[rgba(255,255,255,0.5)]">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-700 dark:text-gray-200">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <img
                          src={item.image}
                          className="w-14 h-14 rounded-lg object-cover"
                          alt={item.title}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{item.title}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Price: ₹{item.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50">
          <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-2xl shadow-xl w-[90%] max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-pink-600 dark:text-pink-400">
              Edit Order
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Order Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="place">Placed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="payment_failed">Payment Failed</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Payment Status
                </label>
                <select
                  value={editPayment}
                  onChange={(e) => setEditPayment(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refund</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 text-sm cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
