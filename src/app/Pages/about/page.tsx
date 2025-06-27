"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function About() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // You can set this if needed elsewhere

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // simulate 1.5s load

    return () => clearTimeout(timer);
  }, []);

  if (loading || actionLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black ">
        <img
          src="/favicon.png"
          alt="Loading"
          className="w-24 h-24 md:w-32 md:h-32 object-contain animate-bounce dark:invert-100"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white font-sans">
      {/* Hero Section */}
      <section className="relative w-full h-64 sm:h-96 md:h-[500px]">
        <Image
          src="https://plus.unsplash.com/premium_photo-1661329971924-13892d896c0b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Fashion Clothes"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-wider text-white text-center drop-shadow-lg">
            About <span className="text-[#FF3F6C]">Shop Mart</span>
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-6xl mx-auto px-6 md:px-0 py-12 sm:py-16 space-y-10">
        <p className="text-base sm:text-lg md:text-xl leading-relaxed text-center max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
          Welcome to{" "}
          <span className="font-semibold text-[#FF3F6C]">Shop Mart</span>, your
          ultimate destination for modern fashion. We believe that style is a
          form of self-expression, and our mission is to empower you with the
          latest trends, premium quality, and unmatched variety. Whether you're
          looking for everyday essentials or bold fashion pieces, Shop Mart has
          it all.
        </p>

        {/* Images Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              src: "https://images.pexels.com/photos/52518/jeans-pants-blue-shop-52518.jpeg?auto=compress&cs=tinysrgb&w=600",
              alt: "Jeans Pants",
            },
            {
              src: "https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg?auto=compress&cs=tinysrgb&w=600",
              alt: "Casual Fashion",
            },
            {
              src: "https://images.pexels.com/photos/8030176/pexels-photo-8030176.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=279.825&fit=crop&h=453.05",
              alt: "Fashion Accessories",
            },
            {
              src: "https://images.pexels.com/photos/3812433/pexels-photo-3812433.jpeg?auto=compress&cs=tinysrgb&w=600",
              alt: "Fashion Model",
            },
          ].map((img, i) => (
            <div
              key={i}
              className="relative h-48 sm:h-64 md:h-72 rounded-lg overflow-hidden shadow-md hover:scale-105 transition-transform duration-300 group"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/10 dark:bg-black/30 group-hover:bg-black/40 transition-all duration-300" />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center mt-16 border-t pt-8 pb-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Shop Mart — Fashion that defines you.
      </footer>
    </div>
  );
}
