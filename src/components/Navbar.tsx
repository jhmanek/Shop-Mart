"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import ThemeButton from "@/components/themebutton";

interface NavbarProps {
  uniqueProductCount: number;
  onCartOpen: () => void;
  navOpen: boolean;
  setNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const userNavLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/Pages/about" },
  { label: "Contact Us", path: "/Pages/contact" },
  { label: "View Orders", path: "/Pages/order" },
];

const adminNavLinks = [
  { label: "Product", path: "/admin/products" },
  { label: "Order", path: "/admin/order" },
];

const Navbar: React.FC<NavbarProps> = ({
  uniqueProductCount,
  onCartOpen,
  navOpen,
  setNavOpen,
}) => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setRole(parsedUser?.role || "user");
    }
  }, []);

  const linksToShow = role === "admin" ? adminNavLinks : userNavLinks;

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-black dark:border-b-[rgba(255,255,255,0.5)] dark:border-b shadow-sm px-4 sm:px-8 py-3">
      <div className="relative flex items-center justify-between w-full">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1 sm:gap-0 cursor-pointer select-none"
          onClick={() => window.scrollTo(0, 0)}
        >
          <Image
            src="/favicon.png"
            alt="ShopMart Logo"
            width={40}
            height={40}
            className="mb-1 dark:invert-100"
          />
          <div className="flex flex-col items-start leading-tight">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Shop
            </h2>
            <p className="text-xl -mt-3 font-semibold text-[#FF3F6C]">Mart</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-6 font-semibold text-gray-700 dark:text-gray-200">
          {linksToShow.map(({ label, path }) => (
            <Link key={label} href={path} className="hover:text-[#FF3F6C]">
              {label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className=" sm:gap-2 flex items-center sm:space-2 space-x-1">
          {/* Cart - only for non-admin */}
          {role !== "admin" && (
            <div
              className="relative cursor-pointer"
              onClick={onCartOpen}
              aria-label="Open Cart"
            >
              <ShoppingCartIcon className="h-7 w-7 text-gray-800 dark:text-white" />
              {uniqueProductCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF3F6C] text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {uniqueProductCount}
                </span>
              )}
            </div>
          )}

          {/* Profile */}
          <Link href="/Pages/profile" aria-label="Profile">
            <UserIcon className="h-7 w-7 text-gray-800 dark:text-white hover:text-[#FF3F6C]" />
          </Link>

          {/* 🌙 Theme Toggle Button beside profile */}
          <ThemeButton />

          {/* Mobile Menu Toggle */}
          <button
            className="text-gray-700 dark:text-white hover:text-[#FF3F6C] focus:outline-none md:hidden"
            onClick={() => setNavOpen(!navOpen)}
            aria-label="Toggle menu"
          >
            {navOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav - now for all roles */}
      {navOpen && (
        <nav className="md:hidden bg-white dark:bg-black text-[16px] px-4 py-3 mt-3 flex flex-col items-center gap-2 justify-center  font-semibold text-gray-700 dark:text-gray-200">
          {linksToShow.map(({ label, path }) => (
            <Link
              key={label}
              href={path}
              onClick={() => setNavOpen(false)}
              className="hover:text-[#FF3F6C]"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
