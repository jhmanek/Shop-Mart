"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { RootState } from "@//store/store";
import Navbar from "@//components/Navbar";
import Cart from "@/app/cart/cart";
import ThemeButton from "@/components/themebutton";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const uniqueProductCount = cartItems.length;

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const pathname = usePathname();

  const hideNavbarRoutes = [
    "/Pages/signup",
    "/Pages/login",
    "/Pages/forgotpassword",
    "/Pages/forgotpassword/verifyotp",
    "/Pages/forgotpassword/resetpassword",
  ];
  const shouldHideNavbar = hideNavbarRoutes.includes(pathname);

  return (
    <>
      {!shouldHideNavbar && (
        <Navbar
          uniqueProductCount={uniqueProductCount}
          onCartOpen={() => setIsCartOpen(true)}
          navOpen={navOpen}
          setNavOpen={setNavOpen}
        />
      )}

      {/* ✅ Show Theme Toggle Button even if Navbar is hidden */}
      {shouldHideNavbar && (
        <div className="fixed top-4 right-4 z-50">
          <ThemeButton />
        </div>
      )}

      {children}

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
