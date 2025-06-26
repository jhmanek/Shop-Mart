// "use client";

// import { useEffect, useState } from "react";
// import { notFound, useRouter } from "next/navigation";

// export default function AddProductPage() {
//   const router = useRouter();

//   const [title, setTitle] = useState("");
//   const [price, setPrice] = useState("");
//   const [description, setDescription] = useState("");
//   const [image, setImage] = useState("");
//   const [category, setCategory] = useState("");
//   const [authorized, setAuthorized] = useState(true);
//   const [checkingAuth, setCheckingAuth] = useState(true);
//   const [loading] = useState(false); // ✅ Add this
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       setAuthorized(false);
//       setCheckingAuth(false);
//       return;
//     }

//     // Optional: Validate token with a quick ping to a protected endpoint
//     setAuthorized(true);
//     setCheckingAuth(false);
//   }, []);

//   if (!authorized && !checkingAuth) {
//     notFound(); // ❌ show 404 if not authorized
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     if (!title || !price || !image || !category) {
//       setError("Please fill all required fields");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch("http://localhost:3000/api/admin/products", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           title,
//           price: Number(price),
//           description,
//           category,
//           image: image,
//         }),
//       });
//       if (!res.ok) {
//         const data = await res.json();
//         setError(data.error || "Failed to add product");
//         return;
//       }

//       router.push("/admin/products");
//     } catch {
//       setError("Something went wrong");
//     }
//   };

//   if (checkingAuth) {
//     return <div className="p-6 text-center">Checking access...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-pink-800 to-white px-4 py-12 flex items-center justify-center">
//       <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
//         <h1 className="text-3xl font-semibold text-pink-700 mb-6 text-center">
//           Add New Product
//         </h1>

//         {error && (
//           <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Product Title <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="w-full border text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Price (₹) <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="number"
//               value={price}
//               min="0"
//               onChange={(e) => setPrice(e.target.value)}
//               className="w-full border text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Description
//             </label>
//             <textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="w-full border text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:outline-none"
//               rows={4}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Image URL <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={image}
//               onChange={(e) => setImage(e.target.value)}
//               className="w-full border text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Category <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               className="w-full border text-gray-700 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:outline-none"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-pink-600 hover:bg-pink-700 transition text-white font-semibold py-2 rounded-lg disabled:opacity-50"
//           >
//             {loading ? "Adding..." : "Add Product"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { categories } from "@/utils/categories";

export default function AddProductPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [authorized, setAuthorized] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthorized(false);
      setCheckingAuth(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (decoded.role !== "admin") {
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    } catch {
      setAuthorized(false);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  if (!authorized) return notFound();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !price || !image || !category) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          price: Number(price),
          description,
          category,
          image,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add product");
        setLoading(false);
        return;
      }

      router.push("/admin/products");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-800 to-white dark:from-pink-900 dark:to-zinc-900 px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-semibold text-pink-700 dark:text-pink-600 mb-6 text-center">
          Add New Product
        </h1>

        {/* ✅ Image URL Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Product Image URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full border text-gray-700 dark:text-white placeholder:text-white dark:bg-zinc-700 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:outline-none"
            placeholder="https://example.com/image.jpg"
          />
          {image && (
            <div className="mt-4 relative flex flex-col items-center">
              <img
                src={image}
                alt="Preview"
                className="w-36 h-36 object-cover rounded-lg border shadow-sm transition-transform hover:scale-105 bg-white dark:bg-zinc-700"
              />
              <button
                type="button"
                onClick={() => setImage("")}
                className="absolute -top-2 -right-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-gray-600 rounded-full w-6 h-6 text-sm text-red-600 flex items-center justify-center shadow hover:bg-red-100 dark:hover:bg-red-800 cursor-pointer"
                title="Remove Image"
              >
                ×
              </button>
              <span className="text-xs text-gray-600 dark:text-white mt-2">
                Preview
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border text-gray-700 dark:text-gray-200 dark:bg-zinc-700 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border text-gray-700 dark:text-gray-200 dark:bg-zinc-700 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border text-gray-700 dark:text-gray-200 dark:bg-zinc-700 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:outline-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border text-gray-700 dark:text-gray-200 dark:bg-zinc-700 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 focus:outline-none"
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
            className="w-full bg-pink-600 hover:bg-pink-700 dark:hover:bg-pink-500 transition text-white font-semibold py-2 rounded-lg disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
