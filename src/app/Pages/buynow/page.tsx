"use client";

import { useCallback } from "react";
import { useTheme } from "next-themes";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function useRazorpay() {
  const { theme } = useTheme(); // 'light' or 'dark'

  const loadRazorpayScript = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (document.getElementById("razorpay-script")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const openRazorpay = useCallback(
    async (
      amountInRupees: number,
      orderId: string,
      onSuccess: (response: any) => void,
      onFailure?: () => void
    ) => {
      const isLoaded = await loadRazorpayScript();

      if (!isLoaded) {
        alert("Razorpay SDK failed to load. Please check your connection.");
        if (onFailure) onFailure();
        return;
      }

      // 🎨 Theme colors based on mode
      const isDarkMode = theme === "dark";
      const themeColor = isDarkMode ? "#121212" : "#3399cc";

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: Math.round(amountInRupees * 100),
        currency: "INR",
        name: "Acme Corp",
        description: "Order Payment",
        order_id: orderId,
        handler: function (response: any) {
          onSuccess(response);
        },
        prefill: {
          name: "Dhaval Parmar",
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: {
          color: themeColor, // ✅ dynamic theme
        },
        method: {
          upi: false,
          card: true,
          netbanking: true,
          wallet: false,
        },
        modal: {
          ondismiss: () => {
            if (onFailure) onFailure();
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    },
    [loadRazorpayScript, theme]
  );

  return { openRazorpay };
}
