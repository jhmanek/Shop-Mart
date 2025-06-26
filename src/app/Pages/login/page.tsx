"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { addToCart } from "@/app/cart/cartslice";

type LoginFormInputs = {
  email: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const [showPassword, setShowPassword] = useState(false);
  const [fade, setFade] = useState(true);

  const cartItems = useSelector((state: RootState) => state.cart.items);

  const toggleShowPassword = () => {
    setFade(false);
    setTimeout(() => {
      setShowPassword((prev) => !prev);
      setFade(true);
    }, 150);
  };

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/login",
        data
      );

      if (response.status === 200 && response.data.token) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        const cartRes = await fetch("http://localhost:3000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cartData = await cartRes.json();
        if (cartData?.cart?.length) {
          cartData.cart.forEach((item: any) => {
            dispatch(addToCart(item));
          });
        }

        if (user.role === "admin") {
          router.push("/admin/products");
        } else {
          router.push("/");
        }
      } else {
        alert("Invalid email or password");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      alert(
        "Login failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-black text-black dark:text-white">
      {/* Left Banner */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-pink-800 via-white dark:via-black to-pink-800 p-10">
        <div className="text-center space-y-6 max-w-sm">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2936/2936994.png"
            alt="Lock and Key Icon"
            className="w-28 mx-auto drop-shadow-md dark:invert-100"
          />
          <h2 className="text-3xl font-bold text-pink-600 dark:text-white">
            Your look Your rules
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Log in and let the world see your vibe
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex justify-center items-center w-full md:w-1/2 px-6 py-12 sm:px-10 min-h-screen md:min-h-0 bg-white dark:bg-black">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
            Log In
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Email */}
            <div className="relative z-0 w-full group">
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                placeholder=" "
                className={`block py-3 px-0 w-full bg-transparent border-0 border-b-2 appearance-none
                focus:outline-none focus:ring-0 peer transition-colors duration-300 text-gray-900 dark:text-white
                ${
                  errors.email
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 dark:border-gray-600 focus:border-pink-600"
                }`}
              />
              <label
                className="absolute text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-0 origin-[0]
                peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400
                peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-pink-600"
              >
                Email
              </label>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative z-0 w-full group">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  pattern: {
                    value:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#]).{8,}$/,
                    message:
                      "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
                  },
                })}
                placeholder=" "
                className={`block py-3 px-0 w-full bg-transparent border-0 border-b-2 appearance-none
                focus:outline-none focus:ring-0 peer transition-opacity duration-200 text-gray-900 dark:text-white
                ${fade ? "opacity-100" : "opacity-0"}
                ${
                  errors.password
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 dark:border-gray-600 focus:border-pink-600"
                }`}
              />
              <label
                className="absolute text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 left-0 origin-[0]
                peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-gray-400
                peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-pink-600"
              >
                Password
              </label>
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-0 top-3 text-gray-500 hover:text-pink-600 dark:text-gray-400"
                tabIndex={-1}
              >
                {showPassword ? <HiEyeOff size={24} /> : <HiEye size={24} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="text-right text-sm">
              <Link
                href="/Pages/forgotpassword"
                className="text-pink-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 py-3 rounded-lg text-white font-medium text-base sm:text-lg transition duration-200"
            >
              Log In
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            Don&apos;t have an account?{" "}
            <Link
              href="/Pages/signup"
              className="text-pink-600 hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
