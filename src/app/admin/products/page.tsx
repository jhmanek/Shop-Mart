"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";

type Product = {
  _id: string;
  title: string;
  price: number;
  image: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [redirectLoading, setRedirectLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(storedToken.split(".")[1]));
      if (decoded.role !== "admin") {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setToken(storedToken);

      fetch("/api/admin/products", {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Failed to fetch products");
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setProducts(data);
          } else {
            console.error("Unexpected data format:", data);
            setProducts([]); // fallback
          }
          setAuthorized(true);
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setAuthorized(false);
        })
        .finally(() => setLoading(false));
    } catch (err) {
      console.error("JWT decode error:", err);
      setAuthorized(false);
      setLoading(false);
    }
  }, []);

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    if (!token) {
      alert("Unauthorized. Please login again.");
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete product");
        return;
      }

      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      alert("Something went wrong");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  if (authorized === null || loading || redirectLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-zinc-900">
        <div className="flex flex-col items-center space-y-4">
          <img
            src="/favicon.png"
            alt="Shop Mart Logo"
            className="w-24 h-24 md:w-32 md:h-32 object-contain animate-bounce"
          />
        </div>
      </div>
    );
  }

  if (authorized === false) return notFound();

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-pink-800 to-gray-100 dark:from-pink-900 dark:to-zinc-900 px-6 py-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 backdrop-blur-sm bg-white/30 dark:bg-white/10 p-4 rounded-xl shadow">
          <h1 className="text-3xl font-semibold text-pink-800 dark:text-pink-400 drop-shadow-sm">
            Product Management
          </h1>

          <button
            onClick={() => {
              setRedirectLoading(true);
              setTimeout(() => {
                router.push("/admin/products/add");
              }, 300);
            }}
            className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800 text-pink-700 dark:text-pink-400 px-5 py-2 rounded-full text-sm font-semibold shadow hover:bg-pink-100 dark:hover:bg-pink-900 transition-all cursor-pointer"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="text-center text-white dark:text-gray-400 text-lg mt-12 italic opacity-75">
            No products available yet. Click "Add Product" to get started.
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white dark:bg-zinc-800 p-5 rounded-2xl shadow-md border border-gray-100 dark:border-zinc-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <img
                    src={product.image}
                    alt={product.title || "Product Image"}
                    className="w-full h-40 object-contain mb-4 rounded-lg bg-gray-50 dark:bg-zinc-700"
                  />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-2 min-h-[3rem]">
                    {product.title}
                  </h2>
                  <p className="text-pink-600 dark:text-pink-400 font-bold text-md mt-2 hover:underline hover:text-pink-700 dark:hover:text-pink-300 transition">
                    ₹{product.price}
                  </p>
                </div>

                <div className="flex justify-end mt-4 gap-2">
                  <Link
                    href={`/admin/products/edit/${product._id}`}
                    title="Edit Product"
                    className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                  >
                    <Pencil size={18} />
                  </Link>

                  <button
                    onClick={() => deleteProduct(product._id)}
                    title="Delete Product"
                    disabled={deletingId === product._id}
                    className={`p-2 rounded-full transition cursor-pointer ${
                      deletingId === product._id
                        ? "bg-red-100 dark:bg-red-900 text-red-400 cursor-not-allowed"
                        : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
                    }`}
                  >
                    <Trash2
                      size={18}
                      className={
                        deletingId === product._id ? "animate-spin" : ""
                      }
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
