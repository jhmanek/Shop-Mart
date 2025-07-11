"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.back(); // Go to previous page after 0.5 sec
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-black px-4">
      <h1 className="text-6xl font-bold text-[#FF3F6C] dark:text-[#FF3F6C] mb-4">
        404
      </h1>
      <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
        Page Not Found
      </p>
    </div>
  );
}
