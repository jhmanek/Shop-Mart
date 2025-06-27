"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "@/app/cart/cartslice";
import { RootState } from "@/store/store";
import { Product } from "@/types/types";
import { TrashIcon } from "@heroicons/react/24/outline";
import Cart from "@/app/cart/cart";
import axios from "axios";
import { useRouter } from "next/navigation";
import { categories } from "@/utils/categories";
import toast from "react-hot-toast";
import CustomToast from "@/components/customToast";
import HomeSlider from "@/components/HomeSlider";

const BATCH_SIZE = 8;

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const router = useRouter();

  // const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  useEffect(() => {
    fetch("http://localhost:3000/api/product")
      .then((res) => res.json())
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Failed to load products.");
        setLoading(false);
      });
  }, []);

  const filteredProducts = categoryFilter
    ? products.filter(
        (p) =>
          p.category?.toLowerCase().trim() ===
          categoryFilter.toLowerCase().trim()
      )
    : products;

  // Infinite scroll setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          visibleCount < filteredProducts.length &&
          !loading
        ) {
          setVisibleCount((prev) =>
            Math.min(prev + BATCH_SIZE, filteredProducts.length)
          );
        }
      },
      { threshold: 1 }
    );

    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [visibleCount, filteredProducts.length, loading, categoryFilter]);

  const handleAddToCart = async (productId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Pages/signup");
      return;
    }

    const product = products.find((p) => p._id === productId);
    if (!product) return;

    // setActionLoading(true); // Optional, shows spinner state
    try {
      const res = await axios.post(
        "http://localhost:3000/api/cart",
        {
          productId: product._id,
          title: product.title,
          image: product.image,
          price: product.price,
          quantity: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(setCart(res.data.cart));
      toast.custom((t) => (
        <CustomToast toast={t} type="success" message="Added to Bag!" />
      ));
    } catch (error: any) {
      toast.custom((t) => (
        <CustomToast toast={t} type="error" message="Failed to add item" />
      ));
      console.error(
        "Error adding to cart:",
        error.response?.data || error.message
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuantityChange = async (
    productId: string,
    action: "increase" | "decrease" | "remove"
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Pages/signup");
      return;
    }

    // setActionLoading(true);

    try {
      const res = await axios.patch(
        "http://localhost:3000/api/cart",
        { productId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setCart(res.data.cart));

      // ✅ Show custom toast with optional onClose action
      if (action === "increase")
        toast.custom((t) => (
          <CustomToast toast={t} type="increase" message="Quantity increased" />
        ));

      if (action === "decrease")
        toast.custom((t) => (
          <CustomToast toast={t} type="decrease" message="Quantity decreased" />
        ));

      if (action === "remove")
        toast.custom((t) => (
          <CustomToast toast={t} type="error" message="Item removed from Bag" />
        ));
    } catch (error: any) {
      toast.custom((t) => (
        <CustomToast toast={t} type="error" message="Failed to update cart" />
      ));
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (loading || actionLoading) {
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

  return (
    <div className="min-h-screen flex flex-col dark:text-white dark:bg-black">
      <HomeSlider />
      {/* Category Filters */}
      <div className="flex overflow-x-auto gap-6 px-4 py-4 sm:px-8 mb-6 text-sm font-semibold text-gray-700 bg-white border-b border-b-[#02010136] dark:text-white dark:bg-black dark:border-b-[rgba(255,255,255,0.5)]">
        {["", ...categories].map((cat) => {
          const isActive = categoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat);
                setVisibleCount(BATCH_SIZE);
              }}
              className={`px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                categoryFilter === cat
                  ? "bg-[#FF3F6C] text-white shadow-md "
                  : "hover:bg-[#ff3f6c1a] text-gray-700 dark:text-white"
              }`}
            >
              <span>
                {cat === ""
                  ? "All"
                  : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </span>
              {isActive && (
                <span className="w-2 h-2 mt-1 bg-[#FF3F6C] rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <main className="flex-grow">
        {error ? (
          <p className="text-center text-red-500 mt-10">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
            No products found.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 sm:px-8">
              {filteredProducts.slice(0, visibleCount).map((product) => {
                const cartItem = cartItems.find(
                  (item) => item.productId === product._id
                );

                return (
                  <div
                    key={product._id}
                    className="bg-white dark:bg-black border border-gray-200 dark:border-neutral-700 p-3 rounded-lg hover:shadow-lg transition duration-300 flex flex-col relative"
                  >
                    <div className="relative h-60 w-full">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw"
                      />
                    </div>

                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {product.title}
                    </h2>

                    <p className="text-gray-600 text-xs mt-1 dark:text-gray-300 line-clamp-2">
                      {product.description}
                    </p>

                    <p className="text-lg font-bold text-black dark:text-white mt-2">
                      ₹{product.price}
                    </p>

                    {!cartItem ? (
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className="mt-auto py-2 rounded text-sm font-semibold tracking-wide 
             text-white bg-[#ff3f6c] hover:bg-[#d82a56] transition duration-300 
             dark:bg-[#ff3f6c] dark:hover:bg-[#ff1f5f] dark:shadow-md shadow-pink-500/10 cursor-pointer"
                      >
                        Add to Bag
                      </button>
                    ) : (
                      <div className="mt-auto flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleQuantityChange(product._id, "decrease")
                            }
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium text-gray-950 dark:text-white">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(product._id, "increase")
                            }
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <TrashIcon
                          onClick={() =>
                            handleQuantityChange(product._id, "remove")
                          }
                          className="h-5 w-5 text-gray-500 hover:text-red-500 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {visibleCount < filteredProducts.length && (
              <div
                ref={observerRef}
                className="flex justify-center py-10 animate-spin-slow"
              >
                <svg
                  className="h-8 w-8 text-[#FF3F6C] animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              </div>
            )}
          </>
        )}
      </main>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <footer className="bg-[#2d2d2d] dark:bg-neutral-900 text-center text-sm text-white py-6 mt-10">
        <p className="text-gray-300">
          Bringing you awesome deals from{" "}
          <span className="font-semibold text-white">Shop Mart</span> 🛒
        </p>
        <p className="mt-1 text-gray-400">
          &copy; {new Date().getFullYear()}{" "}
          <span className="font-bold text-white">Shop Mart</span> — Built with
          for smart shoppers.
        </p>
      </footer>
    </div>
  );
}
