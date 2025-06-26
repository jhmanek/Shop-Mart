"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, notFound } from "next/navigation";
import { categories } from "@/utils/categories";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    image: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (decoded.role !== "admin") {
        setAuthorized(false);
        setLoading(false);
        return;
      }
    } catch {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    fetch("http://localhost:3000/api/admin/products", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        const existing = data.find((p: any) => p._id === productId);
        if (!existing) {
          setAuthorized(false);
        } else {
          setProduct(existing);
        }
        setLoading(false);
      })
      .catch(() => {
        setAuthorized(false);
        setLoading(false);
      });
  }, [productId]);

  if (loading)
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

  if (!authorized) return notFound();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authorized");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/admin/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: productId, ...product }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update product");
        setLoading(false);
        return;
      }

      router.push("/admin/products");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-800 to-white dark:from-pink-900 dark:to-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-800 p-8 shadow-xl rounded-2xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 dark:text-gray-100 mb-4">
          ✏️ Edit Product
        </h2>

        {/* ✅ Image URL Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Product Image URL
          </label>
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            value={product.image}
            onChange={(e) =>
              setProduct((prev) => ({ ...prev, image: e.target.value }))
            }
            className="w-full border text-gray-800 dark:text-gray-200 dark:bg-zinc-700 border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 dark:focus:ring-pink-300 focus:outline-none"
          />

          {product.image && (
            <div className="mt-4 relative group flex flex-col items-center">
              <img
                src={product.image}
                alt="Preview"
                className="w-28 h-28 object-cover rounded-md border shadow-sm transition-transform duration-300 group-hover:scale-105 bg-white dark:bg-zinc-700"
              />
              <button
                type="button"
                onClick={() => setProduct((prev) => ({ ...prev, image: "" }))}
                className="absolute -top-2 -right-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 rounded-full w-6 h-6 text-sm text-red-600 flex items-center justify-center shadow hover:bg-red-100 dark:hover:bg-red-800 cursor-pointer"
                title="Remove image"
              >
                ×
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Preview
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {["title", "description", "price"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                {field}
              </label>
              {field === "description" ? (
                <textarea
                  rows={4}
                  placeholder={`Enter ${field}`}
                  className="w-full border text-gray-800 dark:text-gray-200 dark:bg-zinc-700 border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 dark:focus:ring-pink-300 focus:outline-none"
                  value={(product as any)[field]}
                  onChange={(e) =>
                    setProduct({ ...product, [field]: e.target.value })
                  }
                />
              ) : (
                <input
                  type={field === "price" ? "number" : "text"}
                  step={field === "price" ? "0.01" : undefined}
                  min={field === "price" ? "0" : undefined}
                  placeholder={`Enter ${field}`}
                  className="w-full border text-gray-800 dark:text-gray-200 dark:bg-zinc-700 border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 dark:focus:ring-pink-300 focus:outline-none"
                  value={(product as any)[field]}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      [field]:
                        field === "price"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              )}
            </div>
          ))}

          {/* ✅ Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={product.category}
              onChange={(e) =>
                setProduct({ ...product, category: e.target.value })
              }
              className="w-full border text-gray-800 dark:text-gray-200 dark:bg-zinc-700 border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-pink-400 dark:focus:ring-pink-300 focus:outline-none"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 dark:hover:bg-pink-800 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
